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

runTest("subgenres use allowed characters in ascending order", () => {
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
    const suffixes = nonCatchAll.map(c => c.slice(-1));
    for (let i = 1; i < suffixes.length; i++) {
      const prev = allowedCodeCharacters.indexOf(suffixes[i - 1]);
      const curr = allowedCodeCharacters.indexOf(suffixes[i]);
      if (curr <= prev) {
        failure(`children of "${parent}" have "${suffixes[i]}" after "${suffixes[i - 1]}" (children: ${siblings.join(", ")})`);
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
    if (code.endsWith("8") || code.endsWith("9")) continue; // skip X8/X9 (handled by X89/Misc tests)
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

// External format mappings: [externalName, "CODE Name"] or [num, externalName, "CODE Name"].
// Multiple mappings separated by "; ".
const cdtext = [
  ["Adult Contemporary", "PA Traditional Pop"],
  ["Classical", "C Classical Music"],
  ["Contemporary Christian", "KF Gospel"],
  ["Country", "T Country and Singer-Songwriter"],
  ["Dance", "D Electronic Dance Music"],
  ["Easy Listening", "AE Easy Listening"],
  ["Erotic", "W Miscellaneous"],
  ["Folk", "F Folk"],
  ["Gospel", "KF Gospel"],
  ["Hip Hop", "H Hip Hop"],
  ["Jazz", "J Jazz and Blues"],
  ["Latin", "X Regional Music"],
  ["Musical", "Y Musical Theatre and Entertainment"],
  ["New Age", "AC New Age"],
  ["Opera", "CCA Opera"],
  ["Operetta", "CCA Opera"],
  ["Pop Music", "P Pop"],
  ["Rap", "H Hip Hop"],
  ["Reggae", "UA Reggae"],
  ["Rock Music", "R Rock and Psychedelia"],
  ["Rhythm & Blues", "KA Rhythm and Blues"],
  ["Sound Effects", "6H Sound Effects"],
  ["Soundtrack", "WD Soundtrack"],
  ["Spoken Word", "6A Spoken Word"],
  ["World Music", "X Regional Music"],
];

const id3v1 = [
  [0, "Blues", "JA Blues"],
  [1, "Classic rock", "RA Rock and Roll"],
  [2, "Country", "T Country and Singer-Songwriter"],
  [3, "Dance", "D Electronic Dance Music"],
  [4, "Disco", "DX Disco"],
  [5, "Funk", "KE Funk"],
  [6, "Grunge", "RDA Grunge"],
  [7, "Hip-hop", "H Hip Hop"],
  [8, "Jazz", "J Jazz and Blues"],
  [9, "Metal", "M Metal"],
  [10, "New age", "AC New Age"],
  [11, "Oldies", "RA Rock and Roll"],
  [12, "Other", "W Miscellaneous"],
  [13, "Pop", "P Pop"],
  [14, "Rhythm and blues", "KA Rhythm and Blues"],
  [15, "Rap", "H Hip Hop"],
  [16, "Reggae", "UA Reggae"],
  [17, "Rock", "R Rock and Psychedelia"],
  [18, "Techno", "DC Techno"],
  [19, "Industrial", "NA Industrial"],
  [20, "Alternative", "RD Alternative Rock"],
  [21, "Ska", "UF Ska"],
  [22, "Death metal", "MD Death Metal"],
  [23, "Pranks", "WC Comedy"],
  [24, "Soundtrack", "WD Soundtrack"],
  [25, "Euro-techno", "DC Techno"],
  [26, "Ambient", "AA Ambient"],
  [27, "Trip-hop", "EA Chillout and Downtempo"],
  [28, "Vocal", "6A Spoken Word"],
  [29, "Jazz & funk", "J Jazz and Blues; KE Funk"],
  [30, "Fusion", "JF Jazz Fusion"],
  [31, "Trance", "DD Trance"],
  [32, "Classical", "C Classical Music"],
  [33, "Instrumental", "W Miscellaneous"],
  [34, "Acid", "DAN Acid House"],
  [35, "House", "DA House"],
  [36, "Game", "WE Video Game Music"],
  [37, "Sound clip", "W Miscellaneous"],
  [38, "Gospel", "KF Gospel"],
  [39, "Noise", "ND Noise"],
  [40, "Alternative rock", "RD Alternative Rock"],
  [41, "Bass", "D Electronic Dance Music"],
  [42, "Soul", "KC Soul"],
  [43, "Punk", "V Punk"],
  [44, "Space", "RH Psychedelia"],
  [45, "Meditative", "AA Ambient"],
  [46, "Instrumental pop", "P Pop"],
  [47, "Instrumental rock", "R Rock and Psychedelia"],
  [48, "Ethnic", "X Regional Music"],
  [49, "Gothic", "RF Post-Punk and New Wave"],
  [50, "Darkwave", "VD Post-Punk"],
  [51, "Techno-industrial", "NA Industrial"],
  [52, "Electronic", "E Electronic"],
  [53, "Pop-folk", "F Folk"],
  [54, "Eurodance", "DN EBM and Electro"],
  [55, "Dream", "RD Alternative Rock"],
  [56, "Southern rock", "RPE Southern Rock"],
  [57, "Comedy", "WC Comedy"],
  [58, "Cult", "W Miscellaneous"],
  [59, "Gangsta", "HDA Gangsta Rap"],
  [60, "Top 40", "P Pop"],
  [61, "Christian rap", "H Hip Hop"],
  [62, "Pop/funk", "P Pop; KE Funk"],
  [63, "Jungle music", "DEJ Footwork Jungle"],
  [64, "Native US", "X Regional Music"],
  [65, "Cabaret", "W Miscellaneous"],
  [66, "New wave", "RFA New Wave"],
  [67, "Psychedelic", "RH Psychedelia"],
  [68, "Rave", "D Electronic Dance Music"],
  [69, "Showtunes", "YA Musical Theatre"],
  [70, "Trailer", "W Miscellaneous"],
  [71, "Lo-fi", "HJ Instrumental and Lo-Fi"],
  [72, "Tribal", "DA House; X Regional Music"],
  [73, "Acid punk", "VF Art Punk"],
  [74, "Acid jazz", "KCA Acid Jazz"],
  [75, "Polka", "W Miscellaneous"],
  [76, "Retro", "W Miscellaneous"],
  [77, "Musical", "YA Musical Theatre"],
  [78, "Rock 'n' roll", "RA Rock and Roll"],
  [79, "Hard rock", "RC Hard Rock"],
];

const winampExtensions = [
  [80, "Folk", "F Folk"],
  [81, "Folk rock", "RK Folk Rock"],
  [82, "National folk", "F Folk"],
  [83, "Swing", "JCE Swing"],
  [84, "Fast fusion", "JF Jazz Fusion"],
  [85, "Bebop", "JD Bebop"],
  [86, "Latin", "X Regional Music"],
  [87, "Revival", "W Miscellaneous"],
  [88, "Celtic", "FH Celtic Folk Music"],
  [89, "Bluegrass", "TC Bluegrass"],
  [90, "Avantgarde", "N Experimental and Industrial"],
  [91, "Gothic rock", "VDA Gothic Rock"],
  [92, "Progressive rock", "RE Progressive Rock"],
  [93, "Psychedelic rock", "RHA Psychedelic Rock"],
  [94, "Symphonic rock", "REC Symphonic Prog"],
  [95, "Slow rock", "PC Pop Rock"],
  [96, "Big band", "JCA Big Band"],
  [97, "Chorus", "CC Opera and Vocal Music"],
  [98, "Easy listening", "AE Easy Listening"],
  [99, "Acoustic", "W Miscellaneous"],
  [100, "Humour", "WC Comedy"],
  [101, "Speech", "6A Spoken Word"],
  [102, "Chanson", "TR Chanson a texte"],
  [103, "Opera", "CCA Opera"],
  [104, "Chamber music", "CDD Chamber Music"],
  [105, "Sonata", "CE Romanticism"],
  [106, "Symphony", "CDE Symphony"],
  [107, "Booty bass", "HE Southern Hip Hop"],
  [108, "Primus", "W Miscellaneous"],
  [109, "Porn groove", "KEJ Porn Groove"],
  [110, "Satire", "WC Comedy"],
  [111, "Slow jam", "KD Contemporary RnB"],
  [112, "Club", "D Electronic Dance Music"],
  [113, "Tango", "XMD Rioplatense Music"],
  [114, "Samba", "XH Brazilian Music"],
  [115, "Folklore", "F Folk"],
  [116, "Ballad", "W Miscellaneous"],
  [117, "Power ballad", "W Miscellaneous"],
  [118, "Rhythmic Soul", "KC Soul"],
  [119, "Freestyle", "PDA Latin Freestyle"],
  [120, "Duet", "W Miscellaneous"],
  [121, "Punk rock", "VA Punk Rock"],
  [122, "Drum solo", "W Miscellaneous"],
  [123, "A cappella", "CC Opera and Vocal Music"],
  [124, "Euro-house", "DA House"],
  [125, "Dance hall", "UJ Dancehall"],
  [126, "Goa music", "DD Trance"],
  [127, "Drum & bass", "DE Drum and Bass"],
  [128, "Club-house", "DA House"],
  [129, "Hardcore techno", "DF Hardcore EDM"],
  [130, "Terror", "DW World and Regional EDM"],
  [131, "Indie", "RD Alternative Rock"],
  [132, "Britpop", "RD Alternative Rock"],
  [133, "Negerpunk", "W Miscellaneous"],
  [134, "Polsk punk", "VA Punk Rock"],
  [135, "Beat", "PCA Beat"],
  [136, "Christian gangsta rap", "HD Hardcore Hip Hop and Gangsta"],
  [137, "Heavy metal", "MA Heavy Metal"],
  [138, "Black metal", "ME Black Metal"],
  [139, "Crossover", "MC Thrash Metal"],
  [140, "Contemporary Christian", "W Miscellaneous"],
  [141, "Christian rock", "RN Rock Musical"],
  [142, "Merengue", "XJF Merengue"],
  [143, "Salsa", "XFA Hispanic American Music"],
  [144, "Thrash metal", "MC Thrash Metal"],
  [145, "Anime", "W Miscellaneous"],
  [146, "Jpop", "PE J-Pop"],
  [147, "Synthpop", "EC Synth and Pop Electronic"],
  [148, "Christmas", "W Miscellaneous"],
  [149, "Art rock", "RRF Art Rock"],
  [150, "Baroque", "CAD Baroque Suite"],
  [151, "Bhangra", "FR South Asian Folk Music"],
  [152, "Big beat", "DKC Big Beat"],
  [153, "Breakbeat", "DK Breakbeat"],
  [154, "Chillout", "EA Chillout and Downtempo"],
  [155, "Downtempo", "EAC Downtempo"],
  [156, "Dub", "UE Dub"],
  [157, "EBM", "DN EBM and Electro"],
  [158, "Eclectic", "W Miscellaneous"],
  [159, "Electro", "DNE Electro"],
  [160, "Electroclash", "DN EBM and Electro"],
  [161, "Emo", "VJ Emo"],
  [162, "Experimental", "N Experimental and Industrial"],
  [163, "Garage", "DM UK Bass and UK Garage"],
  [164, "Global", "X Regional Music"],
  [165, "IDM", "ED IDM and Glitch and Experimental"],
  [166, "Illbient", "EDJ Illbient"],
  [167, "Industro-Goth", "EH Industrial Electronic"],
  [168, "Jam band", "RK Folk Rock"],
  [169, "Krautrock", "RRE Experimental Rock"],
  [170, "Leftfield", "DK Breakbeat"],
  [171, "Lounge", "AEA Lounge and Exotica"],
  [172, "Math rock", "RRD Math Rock"],
  [173, "New romantic", "RF Post-Punk and New Wave"],
  [174, "Nu-breakz", "DK Breakbeat"],
  [175, "Post-punk", "VD Post-Punk"],
  [176, "Post-rock", "RRA Post-Rock"],
  [177, "Psytrance", "DDA Psytrance"],
  [178, "Shoegaze", "RD Alternative Rock"],
  [179, "Space rock", "RH Psychedelia"],
  [180, "Trop rock", "RK Folk Rock"],
  [181, "World music", "X Regional Music"],
  [182, "Neoclassical", "CF Modern Classical"],
  [183, "Audiobook", "6E Audiobook"],
  [184, "Audio theatre", "6A Spoken Word"],
  [185, "Neue Deutsche Welle", "RF Post-Punk and New Wave"],
  [186, "Podcast", "6F Podcast"],
  [187, "Indie rock", "RDE Indie Rock"],
  [188, "G-Funk", "HE Southern Hip Hop"],
  [189, "Dubstep", "DJ Dubstep"],
  [190, "Garage rock", "RJ Garage Rock"],
  [191, "Psybient", "EAH Psybient"],
];

function checkMapping(source, label, mapping) {
  for (const part of mapping.split("; ")) {
    const spaceIdx = part.indexOf(" ");
    const code = part.slice(0, spaceIdx);
    const expectedName = part.slice(spaceIdx + 1);
    const entry = options2[code];
    if (!entry) {
      failure(`${source} "${label}": code "${code}" not found in codes.json`);
    } else if (entry.name !== expectedName) {
      failure(`${source} "${label}": expected "${code} ${entry.name}", got "${part}"`);
    }
  }
}

runTest("cdtext mappings are valid", () => {
  for (const [label, mapping] of cdtext) {
    checkMapping("cdtext", label, mapping);
  }
});

runTest("id3v1 mappings are valid", () => {
  for (const [, label, mapping] of id3v1) {
    checkMapping("id3v1", label, mapping);
  }
});

runTest("winamp extension mappings are valid", () => {
  for (const [, label, mapping] of winampExtensions) {
    checkMapping("winampExtensions", label, mapping);
  }
});

runTest("codes.json is sorted in code order", () => {
  // Extract keys from raw text to avoid V8 integer key reordering
  const raw = fs.readFileSync("codes.json", "utf8");
  const codes = [...raw.matchAll(/^  "([^"]+)":/gm)].map(m => m[1]);
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
