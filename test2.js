// Validates codes.json against genres.json (the parsed RYM HTML tree).
//
// 1. Every RYM path from genres.json appears in codes.json somewhere
// 2. Every RYM path only appears once across all codes

const fs = require("fs");

const genres = JSON.parse(fs.readFileSync("genres.json", "utf8"));
const options2 = JSON.parse(fs.readFileSync("codes.json", "utf8"));

let failureCount = 0;
const failures = [];

function failure(msg) {
  failures.push(msg);
}

const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;

function runTest(description, fn) {
  const before = failures.length;
  fn();
  const newFailures = failures.slice(before);
  if (newFailures.length === 0) {
    console.log(`${green("✓")} ${description}`);
  } else {
    console.log(`${red("✗")} ${description}`);
    for (const msg of newFailures) {
      console.log(red(`  - ${msg}`));
    }
    failureCount += newFailures.length;
  }
}

// Build all RYM paths from genres.json
function collectPaths(nodes, prefix) {
  const paths = [];
  for (const node of nodes) {
    const path = prefix ? `${prefix} > ${node.title}` : node.title;
    paths.push(path);
    if (node.children) {
      paths.push(...collectPaths(node.children, path));
    }
  }
  return paths;
}

const allRymPaths = collectPaths(genres, "");

// Build reverse index: rym path -> [code, ...]
const pathToCode = {};
for (const [code, entry] of Object.entries(options2)) {
  for (const rymPath of entry.rym) {
    (pathToCode[rymPath] ??= []).push(code);
  }
}

runTest("every RYM path appears in codes.json", () => {
  const missing = [];
  for (const path of allRymPaths) {
    if (!pathToCode[path]) {
      missing.push(path);
    }
  }
  if (missing.length > 0) {
    // Show first 20
    for (const p of missing.slice(0, 20)) {
      failure(`missing: ${p}`);
    }
    if (missing.length > 20) {
      failure(`... and ${missing.length - 20} more`);
    }
  }
});

runTest("every RYM path appears in only one code", () => {
  const dupes = [];
  for (const [path, codes] of Object.entries(pathToCode)) {
    if (codes.length > 1) {
      dupes.push(`"${path}" appears in ${codes.join(", ")}`);
    }
  }
  if (dupes.length > 0) {
    for (const d of dupes.slice(0, 20)) {
      failure(d);
    }
    if (dupes.length > 20) {
      failure(`... and ${dupes.length - 20} more`);
    }
  }
});

const allRymPathSet = new Set(allRymPaths);

runTest("every rym entry in codes.json exists as a path in genres.json", () => {
  const stale = [];
  for (const [code, entry] of Object.entries(options2)) {
    for (const rymPath of entry.rym) {
      if (!allRymPathSet.has(rymPath)) {
        stale.push(`${code}: ${rymPath}`);
      }
    }
  }
  if (stale.length > 0) {
    for (const s of stale.slice(0, 50)) {
      failure(s);
    }
    if (stale.length > 50) {
      failure(`... and ${stale.length - 50} more`);
    }
  }
});

const allowedCodeCharacters = "ACDEFHJKMNPRTUVWXY2346789";
const allowedCodeRegex = new RegExp(`^[${allowedCodeCharacters}]+$`);

runTest("codes only use allowed characters", () => {
  for (const code of Object.keys(options2)) {
    if (!allowedCodeRegex.test(code)) {
      failure(`code "${code}" contains disallowed characters`);
    }
  }
});

runTest("all codes are 1-3 characters", () => {
  for (const code of Object.keys(options2)) {
    if (code.length < 1 || code.length > 3) {
      failure(`code "${code}" is ${code.length} characters`);
    }
  }
});

// Derive effective name for each code: explicit "name" or first rym entry's leaf
function effectiveName(code) {
  const entry = options2[code];
  if (!entry) return null;
  if (entry.name) return entry.name;
  if (entry.rym.length === 0) return null;
  const leaf = entry.rym[0].split(" > ").pop();
  return leaf;
}

const allowedFileNameCharacters = /^[a-zA-Z0-9 _.\-]+$/;

runTest("name is the first property in every code entry", () => {
  const raw = fs.readFileSync("codes.json", "utf8");
  const entries = [...raw.matchAll(/"([A-Z0-9]+)":\s*\{[\s\n]*"(\w+)"/g)];
  for (const [, code, firstProp] of entries) {
    if (firstProp !== "name") {
      failure(`${code}: first property is "${firstProp}", expected "name"`);
    }
  }
});

runTest("every code has a name", () => {
  for (const [code, entry] of Object.entries(options2)) {
    if (!entry.name) {
      failure(`${code}: missing name`);
    }
  }
});

runTest("all names are unique", () => {
  const seen = {};
  for (const [code, entry] of Object.entries(options2)) {
    if (!entry.name) continue;
    const key = entry.name.toLowerCase();
    if (key in seen) {
      failure(`"${entry.name}" used by both ${seen[key]} and ${code}`);
    } else {
      seen[key] = code;
    }
  }
});

runTest("names use allowed file path characters", () => {
  for (const [code, entry] of Object.entries(options2)) {
    if (entry.name && !allowedFileNameCharacters.test(entry.name)) {
      failure(`${code}: name "${entry.name}" contains invalid file path characters`);
    }
  }
});

runTest("subgenres follow allowed characters in order", () => {
  const codes = Object.keys(options2);
  const byParent = {};
  for (const code of codes) {
    if (code.length < 2) continue;
    const parent = code.slice(0, -1);
    if (parent in options2) {
      (byParent[parent] ??= []).push(code);
    }
  }

  for (const [parent, siblings] of Object.entries(byParent)) {
    const nonCatchAll = siblings.filter(c => !/[89]$/.test(c));
    const suffixes = nonCatchAll.map(c => c.slice(-1)).sort((a, b) =>
      allowedCodeCharacters.indexOf(a) - allowedCodeCharacters.indexOf(b)
    );
    const expected = allowedCodeCharacters.slice(0, suffixes.length);
    for (let i = 0; i < suffixes.length; i++) {
      if (suffixes[i] !== expected[i]) {
        failure(`children of "${parent}" use suffix "${suffixes[i]}" at position ${i} but expected "${expected[i]}" (children: ${siblings.join(", ")})`);
        break;
      }
    }
  }
});

runTest("every 2-char code has an XX8 child named 'Other <parent>'", () => {
  for (const code of Object.keys(options2)) {
    if (code.length !== 2) continue;
    const name = effectiveName(code);
    const child = options2[code + "8"];
    if (!child) {
      failure(`"${code}8" missing for parent "${code} ${name}"`);
    } else {
      const expected = `Other ${name}`;
      const childName = effectiveName(code + "8");
      if (childName !== expected) {
        failure(`"${code}8": expected name "${expected}", got "${childName}"`);
      }
    }
  }
});

runTest("every 2-char code has an XX9 child named 'Unspecified <parent>'", () => {
  for (const code of Object.keys(options2)) {
    if (code.length !== 2) continue;
    const name = effectiveName(code);
    const child = options2[code + "9"];
    if (!child) {
      failure(`"${code}9" missing for parent "${code} ${name}"`);
    } else {
      const expected = `Unspecified ${name}`;
      const childName = effectiveName(code + "9");
      if (childName !== expected) {
        failure(`"${code}9": expected name "${expected}", got "${childName}"`);
      }
    }
  }
});

runTest("every X8 code has an X89 child named 'Misc <parent>'", () => {
  for (const code of Object.keys(options2)) {
    if (!/^[A-Y2-9]8$/.test(code)) continue;
    const miscCode = code.slice(0, -1) + "89";
    const child = options2[miscCode];
    const parentName = effectiveName(code)?.replace(/^Other /, '');
    if (!child) {
      failure(`"${miscCode}" missing for parent "${code} ${effectiveName(code)}"`);
    } else {
      const expected = `Misc ${parentName}`;
      const childName = effectiveName(miscCode);
      if (childName !== expected) {
        failure(`"${miscCode}": expected name "${expected}", got "${childName}"`);
      }
    }
  }
});

runTest("every 1-char code has an X8 child named 'Other <parent>'", () => {
  for (const code of Object.keys(options2)) {
    if (code.length !== 1) continue;
    const name = effectiveName(code);
    const child = options2[code + "8"];
    if (!child) {
      failure(`"${code}8" missing for parent "${code} ${name}"`);
    } else {
      const expected = `Other ${name}`;
      const childName = effectiveName(code + "8");
      if (childName !== expected) {
        failure(`"${code}8": expected name "${expected}", got "${childName}"`);
      }
    }
  }
});

runTest("every 1-char code has an X9 child named 'Unspecified <parent>'", () => {
  for (const code of Object.keys(options2)) {
    if (code.length !== 1) continue;
    const name = effectiveName(code);
    const child = options2[code + "9"];
    if (!child) {
      failure(`"${code}9" missing for parent "${code} ${name}"`);
    } else {
      const expected = `Unspecified ${name}`;
      const childName = effectiveName(code + "9");
      if (childName !== expected) {
        failure(`"${code}9": expected name "${expected}", got "${childName}"`);
      }
    }
  }
});

runTest("codes.json is sorted in code order", () => {
  const codes = Object.keys(options2);
  function codeCompare(a, b) {
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      if (i >= a.length) return -1;
      if (i >= b.length) return 1;
      const ai = allowedCodeCharacters.indexOf(a[i]);
      const bi = allowedCodeCharacters.indexOf(b[i]);
      if (ai !== bi) return ai - bi;
    }
    return 0;
  }
  for (let i = 1; i < codes.length; i++) {
    if (codeCompare(codes[i], codes[i - 1]) < 0) {
      failure(`"${codes[i]}" appears before "${codes[i - 1]}"`);
      break;
    }
  }
});

// Summary stats
const totalCodes = Object.keys(options2).length;
const totalRymEntries = Object.values(options2).reduce((s, e) => s + e.rym.length, 0);
const totalRymPaths = allRymPaths.length;
const coveredPaths = allRymPaths.filter((p) => pathToCode[p]).length;

console.log(`\nCodes: ${totalCodes}  RYM paths in options2: ${totalRymEntries}  RYM paths in HTML: ${totalRymPaths}  Covered: ${coveredPaths}`);

process.exit(failureCount > 0 ? 1 : 0);
