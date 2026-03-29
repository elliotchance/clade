const fs = require("fs");
const path = require("path");

const HTML_DIR = "html";
const GENRES_DIR = path.join(HTML_DIR, "genres");
const BASE_URL = "https://rateyourmusic.com";

const allowedCodeCharacters = "ACDEFHJKMNPRTUVWXY2346789";
const allowedFileNameCharacters = "^[a-zA-Z0-9 _.\\-]+$";

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

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#34;/g, '"');
}

// Find the position after the matching closing tag for a given opening tag at pos.
// `open` and `close` are the opening/closing tag strings to balance.
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

// Parse all genre items from a slice of HTML that represents the contents of
// a hierarchy_list_children <li>. Returns [{title, url, children}].
function parseChildrenContent(html) {
  const items = [];
  let pos = 0;

  while (pos < html.length) {
    // Find the next <ul class="hierarchy_list">
    const ulStart = html.indexOf('<ul class="hierarchy_list"', pos);
    if (ulStart === -1) break;

    // Find end of the opening <ul ...> tag
    const ulTagEnd = html.indexOf(">", ulStart) + 1;

    // Find the matching </ul> for this ul
    const ulContentStart = ulTagEnd;
    const ulEnd = findMatchingClose(html, ulTagEnd, "<ul", "</ul>");

    const ulContent = html.slice(ulContentStart, ulEnd - "</ul>".length);
    pos = ulEnd;

    // Each <ul> here contains exactly one <li class="hierarchy_list_item">
    const item = parseOneItem(ulContent);
    if (item) items.push(item);
  }

  return items;
}

// Parse a single genre item from the content of a <ul class="hierarchy_list">
// that contains one <li class="hierarchy_list_item">.
function parseOneItem(ulContent) {
  const liStart = ulContent.indexOf('<li class="hierarchy_list_item"');
  if (liStart === -1) return null;

  const liTagEnd = ulContent.indexOf(">", liStart) + 1;
  // Find the matching </li>
  const liEnd = findMatchingClose(ulContent, liTagEnd, "<li", "</li>");
  const liContent = ulContent.slice(liTagEnd, liEnd - "</li>".length);

  // Extract title and url from hierarchy_list_item_details
  const detailsStart = liContent.indexOf("hierarchy_list_item_details");
  if (detailsStart === -1) return null;
  const detailsDivEnd = liContent.indexOf("</div>", detailsStart);
  const detailsContent = liContent.slice(detailsStart, detailsDivEnd);

  const linkMatch = detailsContent.match(/<a href="([^"]+)">([^<]+)<\/a>/);
  if (!linkMatch) return null;

  const url = BASE_URL + linkMatch[1];
  const title = decodeEntities(linkMatch[2].trim());

  // Everything after </div> in the li contains nested children (as <ul> elements)
  const afterDetails = liContent.slice(detailsDivEnd + "</div>".length);
  const children = parseChildrenContent(afterDetails);

  return { title, url, ...(children.length ? { children } : {}) };
}

// Parse an individual genre page (e.g. Dance.html).
function parseGenrePage(html) {
  const canonicalMatch = html.match(/<link rel="canonical" href="([^"]+)"/);
  const url = canonicalMatch ? canonicalMatch[1] : null;

  const titleMatch = html.match(/<title>([^<]+?) - Music genre/);
  const title = titleMatch ? decodeEntities(titleMatch[1].trim()) : null;

  // Find the hierarchy section
  const sectionStart = html.indexOf('id="page_genre_section_hierarchy"');
  if (sectionStart === -1) return { title, url, children: [] };

  // Find hierarchy_list_children (contains the direct children)
  const childrenLiStart = html.indexOf('class="hierarchy_list_children"', sectionStart);
  if (childrenLiStart === -1) return { title, url, children: [] };

  const childrenLiTagEnd = html.indexOf(">", childrenLiStart) + 1;
  // Find matching </li> for the hierarchy_list_children li
  const childrenLiEnd = findMatchingClose(html, childrenLiTagEnd, "<li", "</li>");
  const childrenContent = html.slice(childrenLiTagEnd, childrenLiEnd - "</li>".length);

  const children = parseChildrenContent(childrenContent);
  return { title, url, children };
}

// Parse Genres.html index page to get all top-level genres.
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

// Parse Music descriptor.html into a tree of {title, url, children}.
// Structure: top-level descriptors are in <div style="background:..."><b><a class="genre">
// Children are in <blockquote> blocks; sub-parents are nested <div>+<blockquote>.
function parseDescriptorPage(html) {
  const descriptorLinkRe = /<a[^>]*class="genre"[^>]*href="\/music_descriptor\/([^"]+)\/"[^>]*>([^<]+)<\/a>/;

  function parseDescriptorBlock(block) {
    const items = [];
    let pos = 0;
    while (pos < block.length) {
      // Find the next descriptor link
      const linkIdx = block.indexOf('class="genre"', pos);
      if (linkIdx === -1) break;

      // Back up to find the <a tag start
      const aStart = block.lastIndexOf("<a", linkIdx);
      const aEnd = block.indexOf("</a>", linkIdx);
      if (aEnd === -1) break;

      const linkHtml = block.slice(aStart, aEnd + "</a>".length);
      const m = linkHtml.match(descriptorLinkRe);
      if (!m) { pos = aEnd + 4; continue; }

      const url = BASE_URL + "/music_descriptor/" + m[1] + "/";
      const title = decodeEntities(m[2].trim());

      // Check if this is a sub-parent (bold wrapper)
      const isBold = block.lastIndexOf("<b>", linkIdx) > block.lastIndexOf("</b>", linkIdx);

      // Look for a <blockquote> following this descriptor (its children)
      let children = [];
      const afterLink = aEnd + "</a>".length;
      if (isBold) {
        const bqStart = block.indexOf("<blockquote", afterLink);
        const nextDescriptor = block.indexOf('class="genre"', afterLink);
        // Only use this blockquote if it comes before the next non-nested descriptor
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

  // Find the content area (after the admin links, starting from first descriptor div)
  const firstDiv = html.indexOf('<div style="background:var(--mono-f8)');
  if (firstDiv === -1) return [];
  const content = html.slice(firstDiv);

  // Split into top-level descriptor divs
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

      // Children are in blockquote
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

// Main
const genresHtml = fs.readFileSync(path.join(HTML_DIR, "Genres.html"), "utf8");
const topLevel = parseGenresIndex(genresHtml);

// Build canonical-url -> file content map
const urlToEntry = {};
const files = fs
  .readdirSync(GENRES_DIR)
  .filter((f) => f.endsWith(".html"));
for (const file of files) {
  const content = fs.readFileSync(path.join(GENRES_DIR, file), "utf8");
  const m = content.match(/<link rel="canonical" href="([^"]+)"/);
  if (m) urlToEntry[m[1]] = content;
}

const genres = [];
for (const { title, url } of topLevel) {
  const content = urlToEntry[url];
  if (!content) continue;
  const parsed = parseGenrePage(content);
  genres.push({ title: parsed.title || title, url: parsed.url || url, children: parsed.children });
}

// Parse descriptors
const descriptorFile = path.join(HTML_DIR, "Music descriptor.html");
if (fs.existsSync(descriptorFile)) {
  const descriptorHtml = fs.readFileSync(descriptorFile, "utf8");
  const descriptors = parseDescriptorPage(descriptorHtml);
  if (descriptors.length > 0) {
    genres.push({ title: "Descriptor", children: descriptors });
    console.log(`Parsed ${descriptors.length} top-level descriptors`);
  }
}

fs.writeFileSync("genres.json", JSON.stringify(genres, null, 2));
console.log(`Written genres.json with ${genres.length} top-level genres`);

// Stats
let totalNodes = 0;
function count(nodes) { for (const n of nodes) { totalNodes++; if (n.children) count(n.children); } }
count(genres);
console.log(`Total nodes: ${totalNodes}`);

// Phase 2: combine genres.json + options.json → genres.js
//
// options.json items keyed by raw RYM title (may contain HTML entities).
// genres.json titles are already decoded. Decode all option keys/values for matching.

const options = JSON.parse(fs.readFileSync("options.json", "utf8"));

// Build decoded-key lookup: decoded title → {code?, title?, parent?}
// Also index by lowercase for case-insensitive descriptor matching.
const optByTitle = {};
for (const [rawKey, val] of Object.entries(options.items)) {
  const key = decodeEntities(rawKey);
  const entry = {
    ...val,
    _key: key,
    parent: val.parent ? decodeEntities(val.parent) : undefined,
  };
  optByTitle[key] = entry;
  // Add lowercase alias for descriptor entries (code starts with '2')
  const lc = key.toLowerCase();
  if (val.code && val.code.startsWith("2") && lc !== key && !(lc in optByTitle)) {
    optByTitle[lc] = entry;
  }
}

const result = {};
// Track seen titles to deduplicate genres with no parent override (first occurrence wins)
const seenTitles = new Set();

function processNode(node, parentTitle, activeCode) {
  const title = node.title; // already decoded
  const opt = optByTitle[title] || {};

  // If a parent override is set, only process this node under the specified parent
  if (opt.parent !== undefined) {
    if (opt.parent !== parentTitle) return;
  } else {
    // No parent override: deduplicate — first occurrence wins
    if (seenTitles.has(title)) return;
    seenTitles.add(title);
  }

  const displayName = opt.title || opt._key || title;
  const code = opt.code || null;

  if (code) {
    if (!(code in result)) {
      result[code] = { name: displayName, urls: [], aka: [] };
    } else if (displayName !== result[code].name && !result[code].aka.includes(displayName)) {
      result[code].aka.push(displayName);
    }
    if (node.url) result[code].urls.push(node.url);
    if (node.children) {
      for (const child of node.children) processNode(child, title, code);
    }
  } else {
    // For descriptor/scene codes, redirect overflow to appropriate catch-all:
    // 1-char digit codes (2, 3) → X99 (Undecided), 2-char digit codes (2A, 3A) → XX8 (Other)
    let fallbackCode = activeCode;
    if (activeCode && /^[23]$/.test(activeCode)) {
      fallbackCode = activeCode + "99";
    } else if (activeCode && /^[23][A-Z]$/.test(activeCode)) {
      fallbackCode = activeCode + "8";
    }
    if (fallbackCode) {
      if (!(fallbackCode in result)) {
        const fbEntry = Object.entries(optByTitle).find(([, o]) => o.code === fallbackCode);
        const fbName = fbEntry ? (fbEntry[1].title || fbEntry[0]) : fallbackCode;
        result[fallbackCode] = { name: fbName, urls: [], aka: [] };
      }
      if (!result[fallbackCode].aka.includes(displayName)) {
        // Skip if this name already exists as a genre name/aka (case-insensitive)
        const lc = displayName.toLowerCase();
        const clashInResult = Object.entries(result).some(([c, e]) =>
          c !== fallbackCode && (e.name.toLowerCase() === lc || (e.aka || []).some(a => a.toLowerCase() === lc))
        );
        // Also check options.json entries (stubs not yet in result)
        const clashInOptions = Object.entries(optByTitle).some(([k, o]) =>
          o.code && o.code !== fallbackCode && (k.toLowerCase() === lc || (o.title && o.title.toLowerCase() === lc))
        );
        const clashes = clashInResult || clashInOptions;
        if (!clashes) {
          result[fallbackCode].aka.push(displayName);
        }
      }
    }
    if (node.children) {
      for (const child of node.children) processNode(child, title, activeCode);
    }
  }
}

for (const node of genres) processNode(node, null, null);

// Clean up, sort aka
for (const entry of Object.values(result)) {
  if (entry.urls.length === 0) delete entry.urls;
  if (entry.aka.length === 0) delete entry.aka;
  if (entry.aka) entry.aka = entry.aka.sort();
}

// Fallback: create stub entries for any options.json code not reached by the tree walk
for (const [rawKey, val] of Object.entries(options.items)) {
  if (!val.code || val.code in result) continue;
  const key = decodeEntities(rawKey);
  const displayName = val.title || key;
  result[val.code] = { name: displayName, aka: [] };
}

// Fix display names for group parents: ensure the entry with a parent
// override becomes the primary name (not an aka that happened to process first).
for (const [key, opt] of Object.entries(optByTitle)) {
  if (!opt.code || opt.code.length < 3) continue;
  if (!opt.parent) continue;
  const entry = result[opt.code];
  if (!entry) continue;
  const displayName = opt.title || opt._key || key;
  if (entry.name !== displayName) {
    if (!entry.aka) entry.aka = [];
    if (!entry.aka.includes(entry.name)) {
      entry.aka.push(entry.name);
    }
    entry.aka = entry.aka.filter(a => a !== displayName);
    entry.name = displayName;
  }
}

// Push akas from 1-2 char A-X codes down to their Misc (X89/XX89) equivalents
for (const [code, entry] of Object.entries(result)) {
  if (!entry.aka || entry.aka.length === 0) continue;
  if (!/^[A-X]/.test(code[0])) continue;
  if (code.length >= 3) continue;
  const targetCode = code + '89';
  if (!(targetCode in result)) continue;
  const target = result[targetCode];
  if (!target.aka) target.aka = [];
  for (const aka of entry.aka) {
    if (!target.aka.includes(aka)) target.aka.push(aka);
  }
  entry.aka = [];
}

// Re-sort after adding stubs, using allowedCodeCharacters ordering (letters before digits)
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

// Clean up empty aka arrays on stubs
for (const entry of Object.values(sorted)) {
  if (entry.aka && entry.aka.length === 0) delete entry.aka;
}

// Generate all.csv: code,title,count (count = number of codes with this code as prefix)
const allCodes = Object.keys(sorted);
const csvRows = Object.entries(sorted).sort(([a], [b]) => codeCompare(a, b));
const csvLines = ['code,title,count,aka'];
for (const [code, entry] of csvRows) {
  const title = entry.name.replace(/"/g, '""');
  const count = allCodes.filter(c => c !== code && c.startsWith(code)).length;
  const aka = (entry.aka || []).join('; ').replace(/"/g, '""');
  csvLines.push(`${code},"${title}",${count},"${aka}"`);
}
fs.writeFileSync('all.csv', csvLines.join('\n') + '\n');
console.log(`Written all.csv with ${csvLines.length - 1} rows`);

const clade = { genres: sorted, colors, allowedCodeCharacters, allowedFileNameCharacters, releases };

fs.writeFileSync(
  "clade.js",
  "const clade = " +
    JSON.stringify(clade, null, 2) +
    ";\nif (typeof module !== 'undefined') module.exports = { clade };\n"
);
console.log(`Written clade.js with ${Object.keys(sorted).length} genre codes`);
