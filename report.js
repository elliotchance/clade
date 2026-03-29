// Lists all RYM genres with their hierarchy indentation and assigned clade code.
//
// Usage: node report.js [--unassigned]
//   --unassigned  Only show genres with no assigned code

const fs = require("fs");
const { clade } = require("./clade");

const genres = JSON.parse(fs.readFileSync("genres.json", "utf8"));
const options = JSON.parse(fs.readFileSync("options.json", "utf8"));

const unassignedOnly = process.argv.includes("--unassigned");

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#34;/g, '"');
}

// Build options lookup
const optByTitle = {};
for (const [rawKey, val] of Object.entries(options.items)) {
  const key = decodeEntities(rawKey);
  optByTitle[key] = { ...val, _key: key };
}

// Find where a title ends up in clade (as name or aka)
function findInClade(title) {
  for (const [code, entry] of Object.entries(clade.genres)) {
    if (entry.name === title) return { code, role: "name" };
    if (entry.aka?.includes(title)) return { code, role: "aka" };
  }
  return null;
}

// Resolve a genre title to its code assignment
function resolveCode(title) {
  const opt = optByTitle[title];
  if (opt?.code) {
    const entry = clade.genres[opt.code];
    const displayName = opt.title || opt._key || title;
    if (entry && entry.name === displayName) return { code: opt.code, note: "" };
    if (entry && entry.aka?.includes(displayName)) return { code: opt.code, note: " (aka)" };
    if (entry) return { code: opt.code, note: "" };
    return { code: opt.code, note: " (stub)" };
  }
  const found = findInClade(title);
  if (found) {
    if (found.role === "aka") return { code: found.code, note: " (aka)" };
    return { code: found.code, note: "" };
  }
  return null;
}

let total = 0;
let assigned = 0;
let unassigned = 0;

function walk(nodes, depth) {
  for (const node of nodes) {
    total++;
    const title = node.title;
    const result = resolveCode(title);
    const indent = "  ".repeat(depth);

    if (result) {
      assigned++;
      if (!unassignedOnly) {
        const entry = clade.genres[result.code];
        const name = entry?.name || "?";
        const label = name === title ? result.code : `${result.code} ${name}`;
        console.log(`${indent}${title}  ->  ${label}${result.note}`);
      }
    } else {
      unassigned++;
      const line = `${indent}${title}  ->  (none)`;
      console.log(line);
    }

    if (node.children) walk(node.children, depth + 1);
  }
}

for (const topNode of genres) {
  const result = resolveCode(topNode.title);
  if (result) {
    const entry = clade.genres[result.code];
    if (!unassignedOnly) {
      console.log(`${topNode.title}  ->  ${result.code} ${entry?.name || "?"}`);
    }
  } else {
    console.log(`${topNode.title}  ->  (none)`);
  }
  assigned++;
  total++;
  if (topNode.children) walk(topNode.children, 1);
}

console.log(`\nTotal: ${total}  Assigned: ${assigned}  Unassigned: ${unassigned}`);
