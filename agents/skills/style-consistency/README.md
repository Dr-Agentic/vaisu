# Style Consistency Skill

A Claude skill that checks UI code for:

1. **Inline styles with hard‑coded hex colors** – encourages use of semantic tokens (`var(--color-…)`) instead.
2. **Class names that are not whitelisted** – ensures only approved CSS class names are used, preventing ad‑hoc class proliferation.

## How it works
- Scans all `*.tsx` files under `src/`.
- Looks for `style={...}` attributes that contain a `#rrggbb` or `#rgb` color.
- Looks for `className={...}` attributes whose individual class names are **not** listed in `whitelist.txt`.
- Prints a concise report with file, line, and offending snippet.

## Usage
```
/skill style-consistency
```

The skill exits with code 0 when no issues are found, otherwise it prints warnings.

## Configuration
- **Whitelist** – edit `whitelist.txt` to add any class name you consider acceptable.
- **Source root** – if your components live elsewhere, adjust `SRC_ROOT` in `index.js`.

## Extending
- To support additional file extensions (e.g., `.js`, `.jsx`), modify the `getTsxFiles` walker.
- To change the pattern matching logic, edit the regexes in `findInlineHardCodedColors` or `findUnwhitelistedClasses`.

## License
MIT – feel free to copy, modify, and share.