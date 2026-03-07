# clade

A hierarchical music genre classification system. Genres are assigned short codes (1-4 characters) drawn from [RateYourMusic](https://rateyourmusic.com)'s genre taxonomy, organised into a tree you can browse and search interactively.

## [Open Interactive Browser](https://elliotchance.github.io/clade/index.html)

## Code Structure

- Codes are built from the character set `ACDEFHJKMNPRTUVWXY2346789`
- Letters B, G, I, L, O, Q, S, Z are excluded to avoid visual ambiguity
- The first character indicates the top-level category
- Each additional character drills one level deeper into the hierarchy

### Genre Codes (A-X)

| Code | Genre |
| ---- | ----- |
| `A` | Ambient |
| `C` | Classical Music |
| `D` | Electronic Dance Music |
| `E` | Electronic |
| `F` | Folk |
| `H` | Hip Hop |
| `J` | Jazz and Blues |
| `K` | R&B |
| `M` | Metal |
| `N` | Experimental and Industrial |
| `P` | Pop |
| `R` | Rock and Psychedelia |
| `T` | Country and Singer-Songwriter |
| `U` | Reggae and Ska and Dancehall |
| `V` | Punk |
| `W` | Miscellaneous |
| `X` | Regional Music |
| `Y` | Musical Theatre and Entertainment |

### Non-Genre Codes (digits)

| Code | Category |
| ---- | -------- |
| `2` | Descriptor (atmosphere, mood, style, theme, etc.) |
| `3` | Scenes and Movements |
| `4` | Time (decades and years) |
| `7` | Artist Sort (alphabetical artist filing) |
| `6` | Non-music (spoken word, audiobooks, podcasts, etc.) |
| `8` | Other |
| `9` | Unassigned |

## Code Rules

### Sequential Ordering

- Within a parent, children are assigned suffix characters in order: the first child gets `A`, the second `C`, the third `D`, and so on through the allowed character set
- This means the number of children can be inferred from the last suffix used

### Reserved Suffixes

Every code level reserves `8` and `9` for catch-all buckets:

- **`8` = "Other"** — items that belong to this parent but have no specific child code
  - `X8` (e.g. `R8`) = "Other Rock and Psychedelia"
  - `XX8` (e.g. `RD8`) = "Other Alternative Rock"
- **`9` = "Unspecified"** — items not yet classified within this parent
  - `X9` (e.g. `R9`) = "Unspecified Rock and Psychedelia"
  - `XX9` (e.g. `RD9`) = "Unspecified Alternative Rock"
- **`89` = "Misc"** — child of every `X8`, a further catch-all
  - `X89` (e.g. `R89`) = "Misc Rock and Psychedelia"
- **`99` = "Undecided"** — child of every `X9`, explicitly unresolved
  - `X99` (e.g. `R99`) = "Undecided Rock and Psychedelia"

### Aliases (Akas)

- A genre code can have multiple names — the first name encountered in the tree walk anchors the code, subsequent names become aliases (akas)
- When multiple RYM genres share heavy crossover, they are merged under a single code with the primary genre as the name and others as akas
- For 1- and 2-character codes, akas are pushed down to the `X89`/`XX89` "Misc" bucket

### File Path Safety

- Display names must match `^[a-zA-Z0-9 _.\-]+$` (no accents, ampersands, or apostrophes)
- Genres with special characters get a `title` override in `options.json` (e.g. `"Yé-yé"` displays as `"Ye-ye"`)

## How It Works

1. **`html/Genres.html`** — RYM's genre index page, lists top-level genres
2. **`html/genres/*.html`** — individual RYM genre pages with full sub-genre trees
3. **`html/Music descriptor.html`** — RYM's descriptor taxonomy (atmosphere, mood, style, etc.)
4. **`options.json`** — code assignments, title overrides, parent overrides, and pseudo stubs
5. **`generate.js`** — parses HTML into `genres.json`, then combines with `options.json` to produce `clade.js` and `all.csv`
6. **`test.js`** — validates uniqueness, ordering, naming conventions, and structural rules
7. **`clade.js`** — the generated output used by `index.html`

### Running

```bash
node generate.js   # parse HTML + options.json → clade.js, all.csv, genres.json
node test.js        # run all validation tests
```

### options.json Format

Each entry maps a genre/descriptor name to its configuration:

```json
{
  "Bebop": { "code": "JD" },
  "Hard Bop": { "code": "JDA" },
  "Yé-yé": { "code": "PVH", "title": "Ye-ye" },
  "Industrial Hip Hop": { "code": "NCA", "parent": "Post-Industrial" },
  "Other Bebop": { "code": "JD8", "pseudo": true }
}
```

- **`code`** — the assigned clade code
- **`title`** — display name override (when the key contains unsafe characters)
- **`parent`** — forces processing under a specific parent in the tree walk (for genres that appear in multiple places)
- **`pseudo`** — marks entries not found in the RYM source (stubs, catch-alls, manual additions)
