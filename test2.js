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

// Summary stats
const totalCodes = Object.keys(options2).length;
const totalRymEntries = Object.values(options2).reduce((s, e) => s + e.rym.length, 0);
const totalRymPaths = allRymPaths.length;
const coveredPaths = allRymPaths.filter((p) => pathToCode[p]).length;

console.log(`\nCodes: ${totalCodes}  RYM paths in options2: ${totalRymEntries}  RYM paths in HTML: ${totalRymPaths}  Covered: ${coveredPaths}`);

process.exit(failureCount > 0 ? 1 : 0);
