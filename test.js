const fs = require("fs");
const { clade } = require("./clade");

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
    console.log(`${green('✓')} ${description}`);
  } else {
    console.log(`${red('✗')} ${description}`);
    for (const msg of newFailures) {
      console.log(red(`  - ${msg}`));
    }
    failureCount += newFailures.length;
  }
}

runTest("names and akas are globally unique", () => {
  const seen = {};
  for (const [code, entry] of Object.entries(clade.genres)) {
    const labels = [entry.name, ...(entry.aka ?? [])];
    for (const label of labels) {
      const key = label.toLowerCase();
      if (key in seen) {
        failure(`"${label}" appears in ${seen[key]} and ${code}`);
      } else {
        seen[key] = code;
      }
    }
  }
});

runTest("codes use allowed characters", () => {
  const allowed = new RegExp(`^[${clade.allowedCodeCharacters}]+$`);
  for (const code of Object.keys(clade.genres)) {
    if (!allowed.test(code)) {
      failure(`code "${code}" contains disallowed characters`);
    }
  }
});

runTest("codes are at most 3 characters", () => {
  for (const [code, entry] of Object.entries(clade.genres)) {
    if (code.length > 3) {
      failure(`code "${code}" (${entry.name}) exceeds 3 characters`);
    }
  }
});

runTest("names use allowed file path characters", () => {
  const allowed = new RegExp(clade.allowedFileNameCharacters);
  for (const [code, entry] of Object.entries(clade.genres)) {
    if (!allowed.test(entry.name)) {
      failure(`code "${code}" has invalid name: "${entry.name}"`);
    }
    for (const aka of entry.aka ?? []) {
      if (!allowed.test(aka)) {
        failure(`code "${code}" has invalid aka: "${aka}"`);
      }
    }
  }
});

runTest("subgenres follow allowed characters in order", () => {
  const chars = clade.allowedCodeCharacters;

  const byParent = {};
  for (const code of Object.keys(clade.genres)) {
    if (code.length < 2) continue;
    const parent = code.slice(0, -1);
    (byParent[parent] ??= []).push(code);
  }

  for (const [parent, siblings] of Object.entries(byParent)) {
    const nonCatchAll = siblings.filter(c => !/[89]$/.test(c));
    const suffixes = nonCatchAll.map(c => c.slice(-1)).sort((a, b) => chars.indexOf(a) - chars.indexOf(b));
    const expected = chars.slice(0, suffixes.length);
    for (let i = 0; i < suffixes.length; i++) {
      if (suffixes[i] !== expected[i]) {
        failure(`children of "${parent}" use suffix "${suffixes[i]}" at position ${i} but expected "${expected[i]}" (children: ${siblings.join(", ")})`);
        break;
      }
    }
  }
});

// Each entry is [externalName, "CODE Name"] or [num, externalName, "CODE Name"].
// Multiple mappings are separated by "; ".
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
  [4, "Disco", "DN EBM and Electro"],
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
  [119, "Freestyle", "DU Moombahton and Latin Club"],
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
    const name = part.slice(spaceIdx + 1);
    const entry = clade.genres[code];
    if (!entry) {
      failure(`${source} "${label}": code "${code}" not found in clade.genres`);
    } else if (entry.name !== name) {
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

runTest("no 1 or 2 char genre codes have akas", () => {
  for (const [code, entry] of Object.entries(clade.genres)) {
    if (code.length > 2) continue;
    if (/^\d/.test(code)) continue; // skip descriptor/scene codes
    if (entry.aka && entry.aka.length > 0) {
      failure(`"${code} ${entry.name}" has ${entry.aka.length} aka(s): ${entry.aka.slice(0, 3).join(', ')}${entry.aka.length > 3 ? '...' : ''}`);
    }
  }
});

runTest("no 2 or 3 letter codes ending in 9 (but not 89) have akas", () => {
  for (const [code, entry] of Object.entries(clade.genres)) {
    if (!code.endsWith('9') || code.endsWith('89')) continue;
    if (code.length < 2 || code.length > 3) continue;
    if (/^\d/.test(code)) continue; // skip descriptor codes
    if (entry.aka && entry.aka.length > 0) {
      failure(`"${code} ${entry.name}" has ${entry.aka.length} aka(s): ${entry.aka.slice(0, 3).join(', ')}${entry.aka.length > 3 ? '...' : ''}`);
    }
  }
});

runTest("every 2-char code has an XX8 child named 'Other <parent>'", () => {
  for (const [code, entry] of Object.entries(clade.genres)) {
    if (!/^[A-Z]{2}$/.test(code)) continue;
    const child = clade.genres[code + "8"];
    if (!child) {
      failure(`XX8 "${code}8": missing for parent "${code} ${entry.name}"`);
    } else {
      const expected = `Other ${entry.name}`;
      if (child.name !== expected) {
        failure(`XX8 "${code}8": expected name "${expected}", got "${child.name}"`);
      }
    }
  }
});

runTest("every 2-char code has an XX9 child named 'Unspecified <parent>'", () => {
  for (const [code, entry] of Object.entries(clade.genres)) {
    if (!/^[A-Z]{2}$/.test(code)) continue;
    const child = clade.genres[code + "9"];
    if (!child) {
      failure(`XX9 "${code}9": missing for parent "${code} ${entry.name}"`);
    } else {
      const expected = `Unspecified ${entry.name}`;
      if (child.name !== expected) {
        failure(`XX9 "${code}9": expected name "${expected}", got "${child.name}"`);
      }
    }
  }
});

runTest("every X8 code has an X89 child named 'Misc <parent>'", () => {
  for (const [code, entry] of Object.entries(clade.genres)) {
    if (!/^[A-X2-9]8$/.test(code)) continue;
    const child = clade.genres[code.slice(0, -1) + "89"];
    if (!child) {
      failure(`X89 "${code.slice(0, -1)}89": missing for parent "${code} ${entry.name}"`);
    } else {
      const expected = `Misc ${entry.name.replace(/^Other /, '')}`;
      if (child.name !== expected) {
        failure(`X89 "${code.slice(0, -1)}89": expected name "${expected}", got "${child.name}"`);
      }
    }
  }
});

runTest("every 1-char code has an X8 child named 'Other <parent>'", () => {
  for (const [code, entry] of Object.entries(clade.genres)) {
    if (!/^[A-X2-9]$/.test(code)) continue;
    const child = clade.genres[code + "8"];
    if (!child) {
      failure(`X8 "${code}8": missing for parent "${code} ${entry.name}"`);
    } else {
      const expected = `Other ${entry.name}`;
      if (child.name !== expected) {
        failure(`X8 "${code}8": expected name "${expected}", got "${child.name}"`);
      }
    }
  }
});

runTest("every 1-char code has an X9 child named 'Unspecified <parent>'", () => {
  for (const [code, entry] of Object.entries(clade.genres)) {
    if (!/^[A-X2-9]$/.test(code)) continue;
    const child = clade.genres[code + "9"];
    if (!child) {
      failure(`X9 "${code}9": missing for parent "${code} ${entry.name}"`);
    } else {
      const expected = `Unspecified ${entry.name}`;
      if (child.name !== expected) {
        failure(`X9 "${code}9": expected name "${expected}", got "${child.name}"`);
      }
    }
  }
});

runTest("options.json title is never the same as the key", () => {
  const options = JSON.parse(fs.readFileSync("options.json", "utf8"));
  for (const [key, val] of Object.entries(options.items)) {
    if (val.title !== undefined && val.title === key) {
      failure(`"${key}" has title set to same value as key`);
    }
  }
});

runTest("options.json items are sorted by key", () => {
  // Extract keys from raw text to avoid V8 integer key reordering
  const raw = fs.readFileSync("options.json", "utf8");
  const keys = [...raw.matchAll(/^    "([^"]+)":/gm)].map(m => m[1]);
  for (let i = 1; i < keys.length; i++) {
    if (keys[i] < keys[i - 1]) {
      failure(`"${keys[i]}" appears before "${keys[i - 1]}"`);
      break;
    }
  }
});

runTest("non-RYM options.json entries are tagged pseudo:true", () => {
  function collectTitles(nodes, titles) {
    for (const node of nodes) {
      titles.add(node.title);
      if (node.children) collectTitles(node.children, titles);
    }
  }
  const rymTitles = new Set();
  const genres = JSON.parse(fs.readFileSync("genres.json", "utf8"));
  collectTitles(genres, rymTitles);

  const options = JSON.parse(fs.readFileSync("options.json", "utf8"));
  for (const [key, val] of Object.entries(options.items)) {
    const decoded = key.replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
    const isDescriptor = val.code && val.code.startsWith("2");
    const isRym = rymTitles.has(decoded) || rymTitles.has(key) || (isDescriptor && rymTitles.has(decoded.toLowerCase()));
    if (!isRym && !val.pseudo) {
      failure(`"${key}" is not in RYM source but missing pseudo:true`);
    }
    if (isRym && val.pseudo) {
      failure(`"${key}" is in RYM source but incorrectly tagged pseudo:true`);
    }
  }
});

if (failureCount > 0) {
  process.exit(1);
}
