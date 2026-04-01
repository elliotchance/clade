const fs = require("fs");
const path = require("path");

const HTML_DIR = "html";
const GENRES_DIR = path.join(HTML_DIR, "genres");
const BASE_URL = "https://rateyourmusic.com";

const allowedCodeCharacters = "ACDEFHJKMNPRTUVWXY2346789";
const allowedCodeRegex = new RegExp(`^[${allowedCodeCharacters}]+$`);
const allowedFileNameCharacters = /^[a-zA-Z0-9 _.\-]+$/;

const colors = {
  2: { name: "Mint", bgHex: "#00FF99", fgHex: "#000000" },
  3: { name: "Cyan-Green", bgHex: "#00FFCC", fgHex: "#000000" },
  4: { name: "Blue-Violet", bgHex: "#9900FF", fgHex: "#FFFFFF" },
  6: { name: "Violet", bgHex: "#3300FF", fgHex: "#FFFFFF" },
  7: { name: "Lime", bgHex: "#66FF00", fgHex: "#000000" },
  8: { name: "Vermillion", bgHex: "#FF3300", fgHex: "#FFFFFF" },
  9: { name: "Yellow", bgHex: "#FFFF00", fgHex: "#000000" },
  A: { name: "Azure", bgHex: "#0099FF", fgHex: "#000000" },
  C: { name: "Purple", bgHex: "#6600FF", fgHex: "#FFFFFF" },
  D: { name: "Cyan", bgHex: "#00FFFF", fgHex: "#000000" },
  E: { name: "Blue", bgHex: "#0066FF", fgHex: "#FFFFFF" },
  F: { name: "Amber", bgHex: "#FFCC00", fgHex: "#000000" },
  H: { name: "Orange", bgHex: "#FF9900", fgHex: "#000000" },
  J: { name: "Royal Blue", bgHex: "#0033FF", fgHex: "#FFFFFF" },
  K: { name: "Rose", bgHex: "#FF0099", fgHex: "#FFFFFF" },
  M: { name: "Crimson", bgHex: "#FF0066", fgHex: "#FFFFFF" },
  N: { name: "Green", bgHex: "#00FF00", fgHex: "#000000" },
  P: { name: "Hot Pink", bgHex: "#FF00CC", fgHex: "#FFFFFF" },
  R: { name: "Red", bgHex: "#FF0000", fgHex: "#FFFFFF" },
  T: { name: "Yellow-Green", bgHex: "#CCFF00", fgHex: "#000000" },
  U: { name: "Spring Green", bgHex: "#00FF66", fgHex: "#000000" },
  V: { name: "Orange-Red", bgHex: "#FF6600", fgHex: "#000000" },
  W: { name: "Sky Blue", bgHex: "#00CCFF", fgHex: "#000000" },
  X: { name: "Chartreuse", bgHex: "#99FF00", fgHex: "#000000" },
  Y: { name: "Magenta", bgHex: "#CC00FF", fgHex: "#FFFFFF" },
};

const releases = [
  { artist: "Kendrick Lamar", release: "To Pimp a Butterfly", year: "2015", genres: "Conscious Hip Hop, Jazz Rap" },
  { artist: "Radiohead", release: "OK Computer", year: "1997", genres: "Alternative Rock, Art Rock" },
  { artist: "Radiohead", release: "In Rainbows", year: "2007", genres: "Art Rock, Alternative Rock" },
  { artist: "Pink Floyd", release: "Wish You Were Here", year: "1975", genres: "Progressive Rock, Art Rock" },
  { artist: "King Crimson", release: "In the Court of the Crimson King", year: "1969", genres: "Progressive Rock, Art Rock" },
  { artist: "Kendrick Lamar", release: "Good Kid, M.A.A.D City", year: "2012", genres: "Conscious Hip Hop" },
  { artist: "Radiohead", release: "Kid A", year: "2000", genres: "Art Rock, Electronic" },
  { artist: "Madvillain", release: "Madvillainy", year: "2004", genres: "Abstract Hip Hop, Experimental Hip Hop" },
  { artist: "Pink Floyd", release: "The Dark Side of the Moon", year: "1973", genres: "Art Rock, Progressive Rock" },
  { artist: "My Bloody Valentine", release: "Loveless", year: "1991", genres: "Shoegaze, Noise Pop" },
  { artist: "The Beatles", release: "Abbey Road", year: "1969", genres: "Pop Rock" },
  { artist: "Talking Heads", release: "Remain in Light", year: "1980", genres: "New Wave, Post-Punk, Funk Rock" },
  { artist: "David Bowie", release: "The Rise and Fall of Ziggy Stardust and The Spiders From Mars", year: "1972", genres: "Glam Rock, Pop Rock" },
  { artist: "Nas", release: "Illmatic", year: "1994", genres: "Boom Bap, Hardcore Hip Hop" },
  { artist: "", release: "Lift Yr. Skinny Fists Like Antennas to Heaven!", year: "2000", genres: "Post-Rock" },
  { artist: "The Beatles", release: "Revolver", year: "1966", genres: "Pop Rock, Psychedelic Pop" },
  { artist: "Björk", release: "Vespertine", year: "2001", genres: "Art Pop, Electronic, Glitch Pop" },
  { artist: "Black Sabbath", release: "Paranoid", year: "1970", genres: "Heavy Metal, Hard Rock" },
  { artist: "", release: "The Black Saint and the Sinner Lady", year: "1963", genres: "Avant-Garde Jazz, Third Stream" },
  { artist: "The Velvet Underground & Nico", release: "The Velvet Underground &amp; Nico", year: "1967", genres: "Art Rock, Experimental Rock" },
  { artist: "The Cure", release: "Disintegration", year: "1989", genres: "Gothic Rock, Post-Punk" },
  { artist: "John Coltrane", release: "A Love Supreme", year: "1965", genres: "Spiritual Jazz, Avant-Garde Jazz" },
  { artist: "Pink Floyd", release: "Animals", year: "1977", genres: "Progressive Rock, Art Rock" },
  { artist: "King Crimson", release: "Red", year: "1974", genres: "Progressive Rock, Art Rock" },
  { artist: "Miles Davis", release: "Kind of Blue", year: "1959", genres: "Modal Jazz, Cool Jazz" },
  { artist: "Stevie Wonder", release: "Songs in the Key of Life", year: "1976", genres: "Progressive Soul, Soul" },
  { artist: "The Beach Boys", release: "Pet Sounds", year: "1966", genres: "Baroque Pop" },
  { artist: "Fishmans", release: "LONG SEASON", year: "1996", genres: "Neo-Psychedelia, Dream Pop, Progressive Pop" },
  { artist: "Tyler, The Creator", release: "Igor", year: "2019", genres: "Neo-Soul" },
  { artist: "Kanye West", release: "My Beautiful Dark Twisted Fantasy", year: "2010", genres: "Pop Rap, Hip Hop" },
  { artist: "Cocteau Twins", release: "Heaven or Las Vegas", year: "1990", genres: "Dream Pop" },
  { artist: "Wu-Tang Clan", release: "Enter the Wu-Tang (36 Chambers)", year: "1993", genres: "Boom Bap, Hardcore Hip Hop" },
  { artist: "Portishead", release: "Dummy", year: "1994", genres: "Trip Hop" },
  { artist: "Slint", release: "Spiderland", year: "1991", genres: "Post-Rock, Post-Hardcore, Math Rock" },
  { artist: "Kanye West", release: "The College Dropout", year: "2004", genres: "Chipmunk Soul, Pop Rap" },
  { artist: "Nick Drake", release: "Pink Moon", year: "1972", genres: "Contemporary Folk, Singer-Songwriter" },
  { artist: "Neutral Milk Hotel", release: "In the Aeroplane Over the Sea", year: "1998", genres: "Indie Folk, Indie Rock" },
  { artist: "Death Grips", release: "The Money Store", year: "2012", genres: "Industrial Hip Hop, Hardcore Hip Hop, Experimental Hip Hop" },
  { artist: "Slowdive", release: "Souvlaki", year: "1993", genres: "Dream Pop, Shoegaze" },
  { artist: "The Smiths", release: "The Queen Is Dead", year: "1986", genres: "Jangle Pop, Indie Pop" },
  { artist: "The Microphones", release: "&quot;The Glow&quot; Pt. 2", year: "2001", genres: "Indie Folk, Psychedelic Folk, Slacker Rock" },
  { artist: "The Beatles", release: "Sgt. Pepper&#39;s Lonely Hearts Club Band", year: "1967", genres: "Psychedelic Pop, Pop Rock" },
  { artist: "Marvin Gaye", release: "What&#39;s Going On", year: "1971", genres: "Soul, Progressive Soul" },
  { artist: "Björk", release: "Homogenic", year: "1997", genres: "Art Pop, Electronic" },
  { artist: "Frank Ocean", release: "Blonde", year: "2016", genres: "Alternative R&amp;B, Art Pop, Neo-Soul" },
  { artist: "Daft Punk", release: "Discovery", year: "2001", genres: "French House" },
  { artist: "Joy Division", release: "Unknown Pleasures", year: "1979", genres: "Post-Punk" },
  { artist: "Danny Brown", release: "Atrocity Exhibition", year: "2016", genres: "Experimental Hip Hop, Hardcore Hip Hop" },
  { artist: "Miles Davis", release: "In a Silent Way", year: "1969", genres: "Jazz Fusion, Modal Jazz" },
  { artist: "Elliott Smith", release: "Either and Or", year: "1997", genres: "Singer-Songwriter, Indie Folk" },
  { artist: "A Tribe Called Quest", release: "The Low End Theory", year: "1991", genres: "Jazz Rap, Conscious Hip Hop, Boom Bap" },
  { artist: "", release: "F♯A♯∞", year: "1997", genres: "Post-Rock" },
  { artist: "The Beatles", release: "The Beatles [White Album]", year: "1968", genres: "Pop Rock" },
  { artist: "Fishmans", release: "98.12.28 男達の別れ", year: "1999", genres: "Dream Pop, Neo-Psychedelia" },
  { artist: "Aphex Twin", release: "Selected Ambient Works 85-92", year: "1992", genres: "Ambient Techno, IDM" },
  { artist: "David Bowie", release: "★ [Blackstar]", year: "2016", genres: "Art Rock" },
  { artist: "Yes", release: "Close to the Edge", year: "1972", genres: "Symphonic Prog, Progressive Rock" },
  { artist: "Have a Nice Life", release: "Deathconsciousness", year: "2008", genres: "Post-Punk, Shoegaze, Gothic Rock" },
  { artist: "MF DOOM", release: "Mm..Food", year: "2004", genres: "Abstract Hip Hop" },
  { artist: "Nirvana", release: "Nevermind", year: "1991", genres: "Grunge, Alternative Rock" },
  { artist: "Kate Bush", release: "Hounds of Love", year: "1985", genres: "Art Pop, Progressive Pop" },
  { artist: "David Bowie", release: "Low", year: "1977", genres: "Art Rock, Ambient" },
  { artist: "Sufjan Stevens", release: "Illinois", year: "2005", genres: "Chamber Pop, Singer-Songwriter" },
  { artist: "Television", release: "Marquee Moon", year: "1977", genres: "Art Punk, Art Rock, Post-Punk" },
  { artist: "Miles Davis", release: "Bitches Brew", year: "1970", genres: "Jazz Fusion, Avant-Garde Jazz" },
  { artist: "Bob Dylan", release: "Highway 61 Revisited", year: "1965", genres: "Folk Rock, Singer-Songwriter, Blues Rock" },
  { artist: "DJ Shadow", release: "Endtroducing.....", year: "1996", genres: "Instrumental Hip Hop, Experimental Hip Hop, Plunderphonics" },
  { artist: "Black Sabbath", release: "Master of Reality", year: "1971", genres: "Heavy Metal, Traditional Doom Metal" },
  { artist: "Swans", release: "Soundtracks for the Blind", year: "1996", genres: "Experimental Rock, Post-Rock, Experimental" },
  { artist: "Nirvana", release: "In Utero", year: "1993", genres: "Grunge, Noise Rock" },
  { artist: "Jeff Buckley", release: "Grace", year: "1994", genres: "Alternative Rock, Singer-Songwriter" },
  { artist: "J Dilla", release: "Donuts", year: "2006", genres: "Instrumental Hip Hop" },
  { artist: "Pixies", release: "Doolittle", year: "1989", genres: "Indie Rock, Alternative Rock" },
  { artist: "Led Zeppelin", release: "Led Zeppelin [IV]", year: "1971", genres: "Hard Rock" },
  { artist: "Black Country, New Road", release: "Ants From Up There", year: "2022", genres: "Art Rock, Post-Rock, Chamber Pop" },
  { artist: "The Jimi Hendrix Experience", release: "Electric Ladyland", year: "1968", genres: "Blues Rock, Psychedelic Rock, Acid Rock" },
  { artist: "Kanye West", release: "Late Registration", year: "2005", genres: "Pop Rap" },
  { artist: "Nine Inch Nails", release: "The Downward Spiral", year: "1994", genres: "Industrial Rock" },
  { artist: "The Doors", release: "The Doors", year: "1967", genres: "Psychedelic Rock" },
  { artist: "Massive Attack", release: "Mezzanine", year: "1998", genres: "Trip Hop" },
  { artist: "David Bowie", release: "Station to Station", year: "1976", genres: "Art Rock, Funk Rock" },
  { artist: "Metallica", release: "Ride the Lightning", year: "1984", genres: "Thrash Metal" },
  { artist: "Talk Talk", release: "Laughing Stock", year: "1991", genres: "Post-Rock, Art Rock" },
  { artist: "Bob Dylan", release: "Blonde on Blonde", year: "1966", genres: "Folk Rock, Singer-Songwriter" },
  { artist: "Bob Dylan", release: "Blood on the Tracks", year: "1975", genres: "Singer-Songwriter, Folk Rock" },
  { artist: "Magdalena Bay", release: "Imaginal Disk", year: "2024", genres: "Neo-Psychedelia, Synthpop" },
  { artist: "Death", release: "Symbolic", year: "1995", genres: "Technical Death Metal" },
  { artist: "Pharoah Sanders", release: "Karma", year: "1969", genres: "Spiritual Jazz, Avant-Garde Jazz" },
  { artist: "Sufjan Stevens", release: "Carrie &amp; Lowell", year: "2015", genres: "Indie Folk, Singer-Songwriter" },
  { artist: "OutKast", release: "Aquemini", year: "1998", genres: "Conscious Hip Hop" },
  { artist: "Joy Division", release: "Closer", year: "1980", genres: "Post-Punk, Gothic Rock" },
  { artist: "The Avalanches", release: "Since I Left You", year: "2000", genres: "Plunderphonics, Dance" },
  { artist: "A Tribe Called Quest", release: "Midnight Marauders", year: "1993", genres: "Jazz Rap, Boom Bap" },
  { artist: "Milton Nascimento & Lô Borges", release: "Clube da esquina", year: "1972", genres: "MPB" },
  { artist: "Sade", release: "Love Deluxe", year: "1992", genres: "Smooth Soul, Sophisti-Pop, Downtempo" },
  { artist: "Sweet Trip", release: "Velocity : Design : Comfort", year: "2003", genres: "Glitch Pop, IDM" },
  { artist: "Black Sabbath", release: "Black Sabbath", year: "1970", genres: "Heavy Metal, Hard Rock, Occult Rock" },
  { artist: "Stevie Wonder", release: "Innervisions", year: "1973", genres: "Soul, Progressive Soul" },
  { artist: "The Strokes", release: "Is This It", year: "2001", genres: "Garage Rock Revival, Indie Rock" },
  { artist: "Talking Heads", release: "Stop Making Sense", year: "1984", genres: "New Wave, Film Soundtrack, Post-Punk" },
];

// ── HTML Parsing ────────────────────────────────────────────────────────────

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#34;/g, '"');
}

function findMatchingClose(html, pos, open, close) {
  let depth = 1;
  while (pos < html.length && depth > 0) {
    const nextOpen = html.indexOf(open, pos);
    const nextClose = html.indexOf(close, pos);
    if (nextClose === -1) return html.length;
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++;
      pos = nextOpen + open.length;
    } else {
      depth--;
      pos = nextClose + close.length;
    }
  }
  return pos;
}

function parseChildrenContent(html) {
  const items = [];
  let pos = 0;
  while (pos < html.length) {
    const ulStart = html.indexOf('<ul class="hierarchy_list"', pos);
    if (ulStart === -1) break;
    const ulTagEnd = html.indexOf(">", ulStart) + 1;
    const ulEnd = findMatchingClose(html, ulTagEnd, "<ul", "</ul>");
    const ulContent = html.slice(ulTagEnd, ulEnd - "</ul>".length);
    pos = ulEnd;
    const item = parseOneItem(ulContent);
    if (item) items.push(item);
  }
  return items;
}

function parseOneItem(ulContent) {
  const liStart = ulContent.indexOf('<li class="hierarchy_list_item"');
  if (liStart === -1) return null;
  const liTagEnd = ulContent.indexOf(">", liStart) + 1;
  const liEnd = findMatchingClose(ulContent, liTagEnd, "<li", "</li>");
  const liContent = ulContent.slice(liTagEnd, liEnd - "</li>".length);
  const detailsStart = liContent.indexOf("hierarchy_list_item_details");
  if (detailsStart === -1) return null;
  const detailsDivEnd = liContent.indexOf("</div>", detailsStart);
  const detailsContent = liContent.slice(detailsStart, detailsDivEnd);
  const linkMatch = detailsContent.match(/<a href="([^"]+)">([^<]+)<\/a>/);
  if (!linkMatch) return null;
  const url = BASE_URL + linkMatch[1];
  const title = decodeEntities(linkMatch[2].trim());
  const afterDetails = liContent.slice(detailsDivEnd + "</div>".length);
  const children = parseChildrenContent(afterDetails);
  return { title, url, ...(children.length ? { children } : {}) };
}

function parseGenreAkas(html) {
  const akaDiv = html.match(/class="page_genre_akas"[\s\S]*?<\/div>/);
  if (!akaDiv) return [];
  return [...akaDiv[0].matchAll(/<bdi class="comma_separated">([^<]+)<\/bdi>/g)].map(m => decodeEntities(m[1]));
}

function parseGenrePage(html) {
  const canonicalMatch = html.match(/<link rel="canonical" href="([^"]+)"/);
  const url = canonicalMatch ? canonicalMatch[1] : null;
  const titleMatch = html.match(/<title>([^<]+?) - Music genre/);
  const title = titleMatch ? decodeEntities(titleMatch[1].trim()) : null;
  const akas = parseGenreAkas(html);
  const sectionStart = html.indexOf('id="page_genre_section_hierarchy"');
  if (sectionStart === -1) return { title, url, akas, children: [] };
  const childrenLiStart = html.indexOf('class="hierarchy_list_children"', sectionStart);
  if (childrenLiStart === -1) return { title, url, akas, children: [] };
  const childrenLiTagEnd = html.indexOf(">", childrenLiStart) + 1;
  const childrenLiEnd = findMatchingClose(html, childrenLiTagEnd, "<li", "</li>");
  const childrenContent = html.slice(childrenLiTagEnd, childrenLiEnd - "</li>".length);
  const children = parseChildrenContent(childrenContent);
  return { title, url, akas, children };
}

function parseGenresIndex(html) {
  const results = [];
  const marker = 'class="page_genre_index_hierarchy_item_main_inner"';
  let pos = 0;
  while (true) {
    const start = html.indexOf(marker, pos);
    if (start === -1) break;
    const h2Start = html.indexOf("<h2>", start);
    const h2End = html.indexOf("</h2>", h2Start);
    const h2Content = html.slice(h2Start, h2End);
    const linkMatch = h2Content.match(/<a href="([^"]+)">([^<]+)<\/a>/);
    if (linkMatch) {
      results.push({
        url: BASE_URL + linkMatch[1],
        title: decodeEntities(linkMatch[2].trim()),
      });
    }
    pos = h2End;
  }
  return results;
}

function parseDescriptorPage(html) {
  const descriptorLinkRe = /<a[^>]*class="genre"[^>]*href="\/music_descriptor\/([^"]+)\/"[^>]*>([^<]+)<\/a>/;
  function parseDescriptorBlock(block) {
    const items = [];
    let pos = 0;
    while (pos < block.length) {
      const linkIdx = block.indexOf('class="genre"', pos);
      if (linkIdx === -1) break;
      const aStart = block.lastIndexOf("<a", linkIdx);
      const aEnd = block.indexOf("</a>", linkIdx);
      if (aEnd === -1) break;
      const linkHtml = block.slice(aStart, aEnd + "</a>".length);
      const m = linkHtml.match(descriptorLinkRe);
      if (!m) { pos = aEnd + 4; continue; }
      const url = BASE_URL + "/music_descriptor/" + m[1] + "/";
      const title = decodeEntities(m[2].trim());
      const isBold = block.lastIndexOf("<b>", linkIdx) > block.lastIndexOf("</b>", linkIdx);
      let children = [];
      const afterLink = aEnd + "</a>".length;
      if (isBold) {
        const bqStart = block.indexOf("<blockquote", afterLink);
        const nextDescriptor = block.indexOf('class="genre"', afterLink);
        if (bqStart !== -1 && (nextDescriptor === -1 || bqStart < nextDescriptor)) {
          const bqTagEnd = block.indexOf(">", bqStart) + 1;
          const bqEnd = findMatchingClose(block, bqTagEnd, "<blockquote", "</blockquote>");
          const bqContent = block.slice(bqTagEnd, bqEnd - "</blockquote>".length);
          children = parseDescriptorBlock(bqContent);
          pos = bqEnd;
        } else {
          pos = afterLink;
        }
      } else {
        pos = afterLink;
      }
      items.push({ title, url, ...(children.length ? { children } : {}) });
    }
    return items;
  }
  const firstDiv = html.indexOf('<div style="background:var(--mono-f8)');
  if (firstDiv === -1) return [];
  const content = html.slice(firstDiv);
  const topLevel = [];
  let pos = 0;
  const divMarker = '<div style="background:var(--mono-f8);border:var(--mono-b) 1px solid;padding:6px;margin:10px; ">';
  while (pos < content.length) {
    const divStart = content.indexOf(divMarker, pos);
    if (divStart === -1) break;
    const divContentStart = divStart + divMarker.length;
    const divEnd = findMatchingClose(content, divContentStart, "<div", "</div>");
    const divContent = content.slice(divContentStart, divEnd - "</div>".length);
    const m = divContent.match(descriptorLinkRe);
    if (m) {
      const url = BASE_URL + "/music_descriptor/" + m[1] + "/";
      const title = decodeEntities(m[2].trim());
      let children = [];
      const bqStart = divContent.indexOf("<blockquote");
      if (bqStart !== -1) {
        const bqTagEnd = divContent.indexOf(">", bqStart) + 1;
        const bqEnd = findMatchingClose(divContent, bqTagEnd, "<blockquote", "</blockquote>");
        const bqContent = divContent.slice(bqTagEnd, bqEnd - "</blockquote>".length);
        children = parseDescriptorBlock(bqContent);
      }
      topLevel.push({ title, url, ...(children.length ? { children } : {}) });
    }
    pos = divEnd;
  }
  return topLevel;
}

// ── Phase 1: Parse HTML ─────────────────────────────────────────────────────

const genresHtml = fs.readFileSync(path.join(HTML_DIR, "Genres.html"), "utf8");
const topLevel = parseGenresIndex(genresHtml);

const urlToEntry = {};
const files = fs.readdirSync(GENRES_DIR).filter((f) => f.endsWith(".html"));
for (const file of files) {
  const content = fs.readFileSync(path.join(GENRES_DIR, file), "utf8");
  const m = content.match(/<link rel="canonical" href="([^"]+)"/);
  if (m) urlToEntry[m[1]] = content;
}

const genres = [];
const htmlAkas = {}; // title -> [aka, ...]
for (const file of files) {
  const content = fs.readFileSync(path.join(GENRES_DIR, file), "utf8");
  const parsed = parseGenrePage(content);
  if (parsed.title && parsed.akas.length > 0) htmlAkas[parsed.title] = parsed.akas;
}
for (const { title, url } of topLevel) {
  const content = urlToEntry[url];
  if (!content) continue;
  const parsed = parseGenrePage(content);
  genres.push({ title: parsed.title || title, url: parsed.url || url, children: parsed.children });
}

const descriptorFile = path.join(HTML_DIR, "Music descriptor.html");
if (fs.existsSync(descriptorFile)) {
  const descriptorHtml = fs.readFileSync(descriptorFile, "utf8");
  const descriptors = parseDescriptorPage(descriptorHtml);
  if (descriptors.length > 0) {
    genres.push({ title: "Music descriptor", children: descriptors });
  }
}

// Descriptor genre page (not listed in Genres.html index)
const descriptorGenreUrl = BASE_URL + "/genre/descriptor/";
if (urlToEntry[descriptorGenreUrl]) {
  const parsed = parseGenrePage(urlToEntry[descriptorGenreUrl]);
  genres.push({ title: parsed.title || "Descriptor", children: parsed.children });
}

// Build all RYM paths
function collectPaths(nodes, prefix) {
  const paths = [];
  for (const node of nodes) {
    const p = prefix ? `${prefix} > ${node.title}` : node.title;
    paths.push(p);
    if (node.children) paths.push(...collectPaths(node.children, p));
  }
  return paths;
}
const allRymPaths = collectPaths(genres, "");
const allRymPathSet = new Set(allRymPaths);

console.log(`Parsed ${genres.length} top-level genres, ${allRymPaths.length} total paths`);

// ── Phase 2: Validate codes.json ────────────────────────────────────────────

const codes = JSON.parse(fs.readFileSync("codes.json", "utf8"));

// Build reverse index
const pathToCode = {};
for (const [code, entry] of Object.entries(codes)) {
  for (const rymPath of entry.rym || []) {
    (pathToCode[rymPath] ??= []).push(code);
  }
}

const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
let failureCount = 0;
const failures = [];
function failure(msg) { failures.push(msg); }

function runTest(description, fn) {
  const before = failures.length;
  fn();
  const newFailures = failures.slice(before);
  if (newFailures.length === 0) {
    console.log(`${green("✓")} ${description}`);
  } else {
    console.log(`${red("✗")} ${description}`);
    for (const msg of newFailures) console.log(red(`  - ${msg}`));
    failureCount += newFailures.length;
  }
}

runTest("every RYM path appears in codes.json", () => {
  const missing = [];
  for (const p of allRymPaths) {
    if (!pathToCode[p]) missing.push(p);
  }
  if (missing.length > 0) {
    for (const p of missing.slice(0, 20)) failure(`missing: ${p}`);
    if (missing.length > 20) failure(`... and ${missing.length - 20} more`);
  }
});

runTest("every RYM path appears in only one code", () => {
  for (const [p, c] of Object.entries(pathToCode)) {
    if (c.length > 1) failure(`"${p}" appears in ${c.join(", ")}`);
  }
});

runTest("every rym entry in codes.json exists as a path in the HTML", () => {
  const stale = [];
  for (const [code, entry] of Object.entries(codes)) {
    for (const rymPath of entry.rym || []) {
      if (!allRymPathSet.has(rymPath)) stale.push(`${code}: ${rymPath}`);
    }
  }
  if (stale.length > 0) {
    for (const s of stale.slice(0, 50)) failure(s);
    if (stale.length > 50) failure(`... and ${stale.length - 50} more`);
  }
});

runTest("codes only use allowed characters", () => {
  for (const code of Object.keys(codes)) {
    if (!allowedCodeRegex.test(code)) failure(`code "${code}" contains disallowed characters`);
  }
});

runTest("all codes are 1-3 characters", () => {
  for (const code of Object.keys(codes)) {
    if (code.length < 1 || code.length > 3) failure(`code "${code}" is ${code.length} characters`);
  }
});

runTest("name is the first property in every code entry", () => {
  const raw = fs.readFileSync("codes.json", "utf8");
  const entries = [...raw.matchAll(/"([A-Z0-9]+)":\s*\{[\s\n]*"(\w+)"/g)];
  for (const [, code, firstProp] of entries) {
    if (firstProp !== "name") failure(`${code}: first property is "${firstProp}", expected "name"`);
  }
});

runTest("every code has a name", () => {
  for (const [code, entry] of Object.entries(codes)) {
    if (!entry.name) failure(`${code}: missing name`);
  }
});

runTest("all names are unique", () => {
  const seen = {};
  for (const [code, entry] of Object.entries(codes)) {
    if (!entry.name) continue;
    const key = entry.name.toLowerCase();
    if (key in seen) failure(`"${entry.name}" used by both ${seen[key]} and ${code}`);
    else seen[key] = code;
  }
});

runTest("names use allowed file path characters", () => {
  for (const [code, entry] of Object.entries(codes)) {
    if (entry.name && !allowedFileNameCharacters.test(entry.name)) {
      failure(`${code}: name "${entry.name}" contains invalid file path characters`);
    }
  }
});

runTest("subgenres use allowed characters in ascending order", () => {
  const byParent = {};
  for (const code of Object.keys(codes)) {
    if (code.length < 2) continue;
    const parent = code.slice(0, -1);
    if (parent in codes) (byParent[parent] ??= []).push(code);
  }
  for (const [parent, siblings] of Object.entries(byParent)) {
    const suffixes = siblings.filter(c => !/[89]$/.test(c)).map(c => c.slice(-1));
    for (let i = 1; i < suffixes.length; i++) {
      if (allowedCodeCharacters.indexOf(suffixes[i]) <= allowedCodeCharacters.indexOf(suffixes[i - 1])) {
        failure(`children of "${parent}" have "${suffixes[i]}" after "${suffixes[i - 1]}" (children: ${siblings.join(", ")})`);
        break;
      }
    }
  }
});

runTest("every 2-char code has an XX8 child named 'Other <parent>'", () => {
  for (const [code, entry] of Object.entries(codes)) {
    if (code.length !== 2) continue;
    if (code.endsWith("8") || code.endsWith("9")) continue;
    const child = codes[code + "8"];
    if (!child) failure(`"${code}8" missing for parent "${code} ${entry.name}"`);
    else if (child.name !== `Other ${entry.name}`) failure(`"${code}8": expected "Other ${entry.name}", got "${child.name}"`);
  }
});

runTest("every 2-char code has an XX9 child named 'General <parent>'", () => {
  for (const [code, entry] of Object.entries(codes)) {
    if (code.length !== 2) continue;
    if (code.endsWith("8") || code.endsWith("9")) continue;
    const child = codes[code + "9"];
    if (!child) failure(`"${code}9" missing for parent "${code} ${entry.name}"`);
    else if (child.name !== `General ${entry.name}`) failure(`"${code}9": expected "General ${entry.name}", got "${child.name}"`);
  }
});

runTest("every 1-char code has an X9 child named 'General <parent>'", () => {
  for (const [code, entry] of Object.entries(codes)) {
    if (code.length !== 1) continue;
    const child = codes[code + "9"];
    if (!child) failure(`"${code}9" missing for parent "${code} ${entry.name}"`);
    else if (child.name !== `General ${entry.name}`) failure(`"${code}9": expected "General ${entry.name}", got "${child.name}"`);
  }
});

runTest("every X9 code has an X98 child named 'Other <grandparent>' and X99 named 'Misc <grandparent>'", () => {
  for (const code of Object.keys(codes)) {
    if (code.length !== 1) continue;
    const x9 = code + "9";
    if (!codes[x9]) continue;
    const grandparent = codes[code];
    const other = codes[x9 + "8"];
    if (!other) failure(`"${x9}8" missing`);
    else if (other.name !== `Other ${grandparent.name}`) failure(`"${x9}8": expected "Other ${grandparent.name}", got "${other.name}"`);
    const misc = codes[x9 + "9"];
    if (!misc) failure(`"${x9}9" missing`);
    else if (misc.name !== `Misc ${grandparent.name}`) failure(`"${x9}9": expected "Misc ${grandparent.name}", got "${misc.name}"`);
  }
});

runTest("no X8 codes exist as children of 1-char codes", () => {
  for (const code of Object.keys(codes)) {
    if (code.length !== 1) continue;
    if (codes[code + "8"]) failure(`"${code}8" should not exist — use ${code}98 under ${code}9 instead`);
  }
});

// External format mappings
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
  [0, "Blues", "JA Blues"], [1, "Classic rock", "RA Rock and Roll"],
  [2, "Country", "T Country and Singer-Songwriter"], [3, "Dance", "D Electronic Dance Music"],
  [4, "Disco", "DX Disco"], [5, "Funk", "KE Funk"], [6, "Grunge", "RDA Grunge"],
  [7, "Hip-hop", "H Hip Hop"], [8, "Jazz", "J Jazz and Blues"], [9, "Metal", "M Metal"],
  [10, "New age", "AC New Age"], [11, "Oldies", "RA Rock and Roll"],
  [12, "Other", "W Miscellaneous"], [13, "Pop", "P Pop"],
  [14, "Rhythm and blues", "KA Rhythm and Blues"], [15, "Rap", "H Hip Hop"],
  [16, "Reggae", "UA Reggae"], [17, "Rock", "R Rock and Psychedelia"],
  [18, "Techno", "DC Techno"], [19, "Industrial", "NA Industrial"],
  [20, "Alternative", "RD Alternative Rock"], [21, "Ska", "UF Ska"],
  [22, "Death metal", "MD Death Metal"], [23, "Pranks", "WC Comedy"],
  [24, "Soundtrack", "WD Soundtrack"], [25, "Euro-techno", "DC Techno"],
  [26, "Ambient", "AA Ambient"], [27, "Trip-hop", "EA Chillout and Downtempo"],
  [28, "Vocal", "6A Spoken Word"], [29, "Jazz & funk", "J Jazz and Blues; KE Funk"],
  [30, "Fusion", "JF Jazz Fusion"], [31, "Trance", "DD Trance"],
  [32, "Classical", "C Classical Music"], [33, "Instrumental", "W Miscellaneous"],
  [34, "Acid", "DAN Acid House"], [35, "House", "DA House"],
  [36, "Game", "WE Video Game Music"], [37, "Sound clip", "W Miscellaneous"],
  [38, "Gospel", "KF Gospel"], [39, "Noise", "ND Noise"],
  [40, "Alternative rock", "RD Alternative Rock"], [41, "Bass", "D Electronic Dance Music"],
  [42, "Soul", "KC Soul"], [43, "Punk", "V Punk"], [44, "Space", "RH Psychedelia"],
  [45, "Meditative", "AA Ambient"], [46, "Instrumental pop", "P Pop"],
  [47, "Instrumental rock", "R Rock and Psychedelia"], [48, "Ethnic", "X Regional Music"],
  [49, "Gothic", "RF Post-Punk and New Wave"], [50, "Darkwave", "VD Post-Punk"],
  [51, "Techno-industrial", "NA Industrial"], [52, "Electronic", "E Electronic"],
  [53, "Pop-folk", "F Folk"], [54, "Eurodance", "DN EBM and Electro"],
  [55, "Dream", "RD Alternative Rock"], [56, "Southern rock", "RPE Southern Rock"],
  [57, "Comedy", "WC Comedy"], [58, "Cult", "W Miscellaneous"],
  [59, "Gangsta", "HDA Gangsta Rap"], [60, "Top 40", "P Pop"],
  [61, "Christian rap", "H Hip Hop"], [62, "Pop/funk", "P Pop; KE Funk"],
  [63, "Jungle music", "DEJ Footwork Jungle"], [64, "Native US", "X Regional Music"],
  [65, "Cabaret", "W Miscellaneous"], [66, "New wave", "RFA New Wave"],
  [67, "Psychedelic", "RH Psychedelia"], [68, "Rave", "D Electronic Dance Music"],
  [69, "Showtunes", "YA Musical Theatre"], [70, "Trailer", "W Miscellaneous"],
  [71, "Lo-fi", "HJ Instrumental and Lo-Fi"], [72, "Tribal", "DA House; X Regional Music"],
  [73, "Acid punk", "VF Art Punk"], [74, "Acid jazz", "KCA Acid Jazz"],
  [75, "Polka", "W Miscellaneous"], [76, "Retro", "W Miscellaneous"],
  [77, "Musical", "YA Musical Theatre"], [78, "Rock 'n' roll", "RA Rock and Roll"],
  [79, "Hard rock", "RC Hard Rock"],
];

const winampExtensions = [
  [80, "Folk", "F Folk"], [81, "Folk rock", "RK Folk Rock"],
  [82, "National folk", "F Folk"], [83, "Swing", "JCE Swing"],
  [84, "Fast fusion", "JF Jazz Fusion"], [85, "Bebop", "JD Bebop"],
  [86, "Latin", "X Regional Music"], [87, "Revival", "W Miscellaneous"],
  [88, "Celtic", "FH Celtic Folk Music"], [89, "Bluegrass", "TC Bluegrass"],
  [90, "Avantgarde", "N Experimental and Industrial"],
  [91, "Gothic rock", "VDA Gothic Rock"], [92, "Progressive rock", "RE Progressive Rock"],
  [93, "Psychedelic rock", "RHA Psychedelic Rock"],
  [94, "Symphonic rock", "REC Symphonic Prog"], [95, "Slow rock", "PC Pop Rock"],
  [96, "Big band", "JCA Big Band"], [97, "Chorus", "CC Opera and Vocal Music"],
  [98, "Easy listening", "AE Easy Listening"], [99, "Acoustic", "W Miscellaneous"],
  [100, "Humour", "WC Comedy"], [101, "Speech", "6A Spoken Word"],
  [102, "Chanson", "TR Chanson a texte"], [103, "Opera", "CCA Opera"],
  [104, "Chamber music", "CDD Chamber Music"], [105, "Sonata", "CE Romanticism"],
  [106, "Symphony", "CDE Symphony"], [107, "Booty bass", "HE Southern Hip Hop"],
  [108, "Primus", "W Miscellaneous"], [109, "Porn groove", "KEJ Porn Groove"],
  [110, "Satire", "WC Comedy"], [111, "Slow jam", "KD Contemporary RnB"],
  [112, "Club", "D Electronic Dance Music"], [113, "Tango", "XMD Rioplatense Music"],
  [114, "Samba", "XH Brazilian Music"], [115, "Folklore", "F Folk"],
  [116, "Ballad", "W Miscellaneous"], [117, "Power ballad", "W Miscellaneous"],
  [118, "Rhythmic Soul", "KC Soul"], [119, "Freestyle", "PDA Latin Freestyle"],
  [120, "Duet", "W Miscellaneous"], [121, "Punk rock", "VA Punk Rock"],
  [122, "Drum solo", "W Miscellaneous"], [123, "A cappella", "CC Opera and Vocal Music"],
  [124, "Euro-house", "DA House"], [125, "Dance hall", "UJ Dancehall"],
  [126, "Goa music", "DD Trance"], [127, "Drum & bass", "DE Drum and Bass"],
  [128, "Club-house", "DA House"], [129, "Hardcore techno", "DF Hardcore EDM"],
  [130, "Terror", "DW World and Regional EDM"], [131, "Indie", "RD Alternative Rock"],
  [132, "Britpop", "RD Alternative Rock"], [133, "Negerpunk", "W Miscellaneous"],
  [134, "Polsk punk", "VA Punk Rock"], [135, "Beat", "PCA Beat"],
  [136, "Christian gangsta rap", "HD Hardcore Hip Hop and Gangsta"],
  [137, "Heavy metal", "MA Heavy Metal"], [138, "Black metal", "ME Black Metal"],
  [139, "Crossover", "MC Thrash Metal"],
  [140, "Contemporary Christian", "W Miscellaneous"],
  [141, "Christian rock", "RN Rock Musical"], [142, "Merengue", "XJF Merengue"],
  [143, "Salsa", "XFA Hispanic American Music"], [144, "Thrash metal", "MC Thrash Metal"],
  [145, "Anime", "W Miscellaneous"], [146, "Jpop", "PE J-Pop"],
  [147, "Synthpop", "EC Synth and Pop Electronic"], [148, "Christmas", "W Miscellaneous"],
  [149, "Art rock", "RRF Art Rock"], [150, "Baroque", "CAD Baroque Suite"],
  [151, "Bhangra", "FR South Asian Folk Music"], [152, "Big beat", "DKC Big Beat"],
  [153, "Breakbeat", "DK Breakbeat"], [154, "Chillout", "EA Chillout and Downtempo"],
  [155, "Downtempo", "EAC Downtempo"], [156, "Dub", "UE Dub"],
  [157, "EBM", "DN EBM and Electro"], [158, "Eclectic", "W Miscellaneous"],
  [159, "Electro", "DNE Electro"], [160, "Electroclash", "DN EBM and Electro"],
  [161, "Emo", "VJ Emo"], [162, "Experimental", "N Experimental and Industrial"],
  [163, "Garage", "DM UK Bass and UK Garage"], [164, "Global", "X Regional Music"],
  [165, "IDM", "ED IDM and Glitch and Experimental"],
  [166, "Illbient", "EDJ Illbient"], [167, "Industro-Goth", "EH Industrial Electronic"],
  [168, "Jam band", "RK Folk Rock"], [169, "Krautrock", "RRE Experimental Rock"],
  [170, "Leftfield", "DK Breakbeat"], [171, "Lounge", "AEA Lounge and Exotica"],
  [172, "Math rock", "RRD Math Rock"],
  [173, "New romantic", "RF Post-Punk and New Wave"],
  [174, "Nu-breakz", "DK Breakbeat"], [175, "Post-punk", "VD Post-Punk"],
  [176, "Post-rock", "RRA Post-Rock"], [177, "Psytrance", "DDA Psytrance"],
  [178, "Shoegaze", "RD Alternative Rock"], [179, "Space rock", "RH Psychedelia"],
  [180, "Trop rock", "RK Folk Rock"], [181, "World music", "X Regional Music"],
  [182, "Neoclassical", "CF Modern Classical"], [183, "Audiobook", "6E Audiobook"],
  [184, "Audio theatre", "6A Spoken Word"],
  [185, "Neue Deutsche Welle", "RF Post-Punk and New Wave"],
  [186, "Podcast", "6F Podcast"], [187, "Indie rock", "RDE Indie Rock"],
  [188, "G-Funk", "HE Southern Hip Hop"], [189, "Dubstep", "DJ Dubstep"],
  [190, "Garage rock", "RJ Garage Rock"], [191, "Psybient", "EAH Psybient"],
];

function checkMapping(source, label, mapping) {
  for (const part of mapping.split("; ")) {
    const spaceIdx = part.indexOf(" ");
    const code = part.slice(0, spaceIdx);
    const expectedName = part.slice(spaceIdx + 1);
    const entry = codes[code];
    if (!entry) failure(`${source} "${label}": code "${code}" not found in codes.json`);
    else if (entry.name !== expectedName) failure(`${source} "${label}": expected "${code} ${entry.name}", got "${part}"`);
  }
}

runTest("cdtext mappings are valid", () => {
  for (const [label, mapping] of cdtext) checkMapping("cdtext", label, mapping);
});

runTest("id3v1 mappings are valid", () => {
  for (const [, label, mapping] of id3v1) checkMapping("id3v1", label, mapping);
});

runTest("winamp extension mappings are valid", () => {
  for (const [, label, mapping] of winampExtensions) checkMapping("winampExtensions", label, mapping);
});

runTest("codes.json is sorted in code order", () => {
  const raw = fs.readFileSync("codes.json", "utf8");
  const keys = [...raw.matchAll(/"([A-Z0-9]+)":\s*\{/gm)].map(m => m[1]);
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
  for (let i = 1; i < keys.length; i++) {
    if (codeCompare(keys[i], keys[i - 1]) < 0) {
      failure(`"${keys[i]}" appears before "${keys[i - 1]}"`);
      break;
    }
  }
});

runTest("every genre in Genres.html has a page in html/genres", () => {
  for (const { title, url } of topLevel) {
    if (!urlToEntry[url]) failure(`"${title}" (${url}) has no matching HTML file`);
  }
});

runTest("every 3-char code has a 2-char parent", () => {
  for (const code of Object.keys(codes)) {
    if (code.length !== 3) continue;
    const parent = code.slice(0, 2);
    if (!codes[parent]) failure(`"${code}" has no parent "${parent}"`);
  }
});

runTest("every 2-char code has at least one 3-char child", () => {
  for (const code of Object.keys(codes)) {
    if (code.length !== 2) continue;
    const hasChild = Object.keys(codes).some(c => c.length === 3 && c.startsWith(code));
    if (!hasChild) failure(`"${code}" (${codes[code].name}) has no 3-char children`);
  }
});

if (failureCount > 0) {
  console.log(red(`\n${failureCount} test failure(s) — clade.js not generated`));
  process.exit(1);
}

// ── Phase 3: Generate clade.js ──────────────────────────────────────────────

// Map genre page titles to codes via bare rym paths and name matches
const titleToCode = {};
for (const [code, entry] of Object.entries(codes)) {
  if (entry.name && !titleToCode[entry.name]) titleToCode[entry.name] = code;
  for (const rymPath of entry.rym || []) {
    if (!rymPath.includes(" > ") && !titleToCode[rymPath]) titleToCode[rymPath] = code;
  }
}

const result = {};
for (const [code, entry] of Object.entries(codes)) {
  const aka = [];
  for (const rymPath of entry.rym || []) {
    const leaf = rymPath.split(" > ").pop();
    if (leaf !== entry.name && !aka.includes(leaf)) aka.push(leaf);
  }
  // Merge HTML AKAs for genres whose title maps to this code
  for (const [title, akas] of Object.entries(htmlAkas)) {
    const mappedCode = titleToCode[title];
    if (mappedCode !== code) continue;
    for (const a of akas) {
      if (a !== entry.name && !aka.includes(a)) aka.push(a);
    }
  }
  result[code] = { name: entry.name };
  if (aka.length > 0) result[code].aka = aka.sort();
}

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
const sorted = Object.fromEntries(
  Object.entries(result).sort(([a], [b]) => codeCompare(a, b))
);

const clade = { genres: sorted, colors, allowedCodeCharacters, allowedFileNameCharacters: allowedFileNameCharacters.source, releases };

fs.writeFileSync(
  "clade.js",
  "// GENERATED FILE — DO NOT EDIT. Run `node generate.js` to regenerate.\n" +
    "const clade = " +
    JSON.stringify(clade, null, 2) +
    ";\nif (typeof module !== 'undefined') module.exports = { clade };\n"
);
console.log(`\nWritten clade.js with ${Object.keys(sorted).length} genre codes`);
