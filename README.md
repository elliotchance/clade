# clade

A hierarchical music genre classification system. Genres are assigned short codes (1-3 characters) drawn from [RateYourMusic](https://rateyourmusic.com)'s genre taxonomy, organised into a tree you can browse and search interactively.

[![Open Interactive Browser](https://img.shields.io/badge/%F0%9F%8C%90_Open_Interactive_Browser-blue?style=for-the-badge&logoColor=white)](https://elliotchance.github.io/clade/index.html)

## Genre Codes (A-X)

| Code | Genre                             |
| ---- | --------------------------------- |
| `A`  | Ambient                           |
| `C`  | Classical Music                   |
| `D`  | Electronic Dance Music            |
| `E`  | Electronic                        |
| `F`  | Folk                              |
| `H`  | Hip Hop                           |
| `J`  | Jazz and Blues                    |
| `K`  | R&B                               |
| `M`  | Metal                             |
| `N`  | Experimental and Industrial       |
| `P`  | Pop                               |
| `R`  | Rock and Psychedelia              |
| `T`  | Country and Singer-Songwriter     |
| `U`  | Reggae and Ska and Dancehall      |
| `V`  | Punk                              |
| `W`  | Miscellaneous                     |
| `X`  | Regional Music                    |
| `Y`  | Musical Theatre and Entertainment |

## Non-Genre Codes (digits)

| Code | Category                                            |
| ---- | --------------------------------------------------- |
| `2`  | Descriptor (atmosphere, mood, style, theme, etc.)   |
| `3`  | Scenes and Movements                                |
| `4`  | Time (decades and years)                            |
| `7`  | Artist Sort (alphabetical artist filing)            |
| `6`  | Non-music (spoken word, audiobooks, podcasts, etc.) |
| `8`  | Other                                               |
| `9`  | Unassigned                                          |

## Guidelines

- Codes are built from the character set `ACDEFHJKMNPRTUVWXY2346789`. Letters B,
  G, I, L, O, Q, S, Z are excluded to avoid visual ambiguity.
- The first character indicates the top-level category and each additional
  character drills one level deeper into the hierarchy
- Every code level reserves `9` (General/Other/Unspecified/Misc).
- Display names must match `^[a-zA-Z0-9 _.\-]+$` (no accents, ampersands, or
  apostrophes) so they are friendly to use in file names. Special characters are
  also replaced (e.g. `"Yé-yé"` displays as `"Ye-ye"`)

## How It Works

1. **`html/Genres.html`** — RYM's genre index page, lists top-level genres
2. **`html/genres/*.html`** — individual RYM genre pages with full sub-genre trees
3. **`html/Music descriptor.html`** — RYM's descriptor taxonomy (atmosphere, mood, style, etc.)
4. **`codes.json`** — code assignments, names, aliases, and RYM path mappings
5. **`generate.js`** — parses HTML, validates `codes.json`, runs tests, and produces `clade.js`
6. **`report.js`** — lists all RYM genres with their hierarchy and assigned codes (use `--unassigned` to filter)
7. **`clade.js`** — the generated output used by `index.html`

### Running

```bash
node generate.js   # parse HTML + codes.json → clade.js (includes validation tests)
```

### codes.json Format

Each entry maps a code to its name, aliases, and RYM source paths:

```json
{
  "AA": { "name": "Ambient", "aka": ["Chillout Ambient"], "rym": ["Ambient"] },
  "JD": { "name": "Bebop", "rym": ["Jazz > Bebop"] },
  "JDA": { "name": "Hard Bop", "rym": ["Jazz > Bebop > Hard Bop"] },
  "JD8": { "name": "Other Bebop" }
}
```

- **`name`** — display name for the code
- **`aka`** — alternative names (aliases) for the genre
- **`rym`** — RYM taxonomy paths that map to this code
