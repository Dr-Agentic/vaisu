#!/usr/bin/env node
/**
 * style-consistency skill (enhanced)
 *
 * 1️⃣ Detects hard‑coded hex colours and verifies they map to a
 *    defined semantic token (read from design‑token source).
 * 2️⃣ Enforces a naming convention for utility classes:
 *    classes must start with one of the allowed prefixes
 *    (c‑, b‑, p‑, m‑, gap‑, r‑, e‑, f‑, lh‑).
 * 3️⃣ Optionally checks WCAG contrast if a contrast library is
 *    available (currently just logs a reminder).
 *
 * Usage:
 *   /skill style-consistency
 *
 * The skill prints a short report and exits with code 0.
 */

const fs = require('fs');
const path = require('path');

/* ---------------------------------------------------------------------------
 * Configuration
 * --------------------------------------------------------------------------- */
// Path to the design‑token source (adjust if you move the file)
const TOKENS_SRC = path.join(__dirname, '..', '..', 'frontend', 'src', 'design-system', 'tokens.ts');
// AUTO‑GENERATED JSON with the *values* of the semantic tokens (generated once)
const TOKEN_VALUES_JSON = path.join(__dirname, 'semantic-colors.json');
// Whitelist file for class names (kept for backward compatibility – will be
// overwritten automatically if missing or outdated)
const WHITELIST_FILE = path.join(__dirname, 'whitelist.txt');

// Prefixes that denote a semantic utility class
const SEMANTIC_PREFIXES = new Set(['c-', 'b-', 'p-', 'm-', 'gap-', 'r-', 'e-', 'f-', 'lh-']);

/* ---------------------------------------------------------------------------
 * Helper: Load & parse design tokens
 * --------------------------------------------------------------------------- */

/**
 * Extract the exported `colorPalette` and `designTokens` objects from
 * `tokens.ts`.  The file is parsed as plain text – we look for:
 *   export const colorPalette = { … };
 *   export const designTokens = { … };
 * and then JSON‑stringify the inner objects.
 *
 * @returns {Object}Flattened token map: { primary: '#6366F1', secondary: '#8B5CF6', ... }
 */
function loadSemanticTokenValues() {
  if (!fs.existsSync(TOKENS_SRC)) {
    console.error(`⚠️  Token source file not found at ${TOKENS_SRC}`);
    process.exit(1);
  }
  const content = fs.readFileSync(TOKENS_SRC, 'utf8');

  // Simple regex to pull out the two exported objects
  const colorPaletteRe = /export\s+const\s+colorPalette\s*=\s*({[^}]+})/;
  const tokensRe = /export\s+const\s+designTokens\s*=\s*({[^}]+})/;

  const colorMatch = content.match(colorPaletteRe);
  const tokensMatch = content.match(tokensRe);

  if (!colorMatch && !tokensMatch) {
    console.error('⚠️  Could not locate exported colour or token objects in tokens.ts');
    process.exit(1);
  }

  const extract = (match) => {
    const raw = match[1];
    // Remove comments and trim
    const cleaned = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/[\r\n]+/g, '');
    // Convert trailing commas to valid JSON
    const json = cleaned.replace(/,$/gm, '').replace(/^\s+|\s+$/g, '');
    return JSON.parse(json);
  };

  const colorObj = colorMatch ? extract(colorMatch) : {};
  const tokenObj = tokensMatch ? extract(tokensMatch) : {};

  // Merge both sources – colourPalette takes precedence for colour values
  const all = { ...colorObj, ...tokenObj };

  // Flatten any nested objects (e.g., colorPalette.primary[50] -> primary-50)
  const flat = {};
  const flatten = (obj, prefix = '') => {
    for (const [k, v] of Object.entries(obj)) {
      const key = prefix ? `${prefix}-${k}` : k;
      if (typeof v === 'object' && !Array.isArray(v) && v !== null) {
        flatten(v, key);
      } else {
        flat[key] = v;
      }
    }
  };
  flatten(all);

  return flat;
}

/**
 * Load the auto‑generated JSON that maps semantic token names to their hex values.
 * If the file does not exist, generate it from the source tokens.
 */
function ensureTokenValuesFile() {
  if (fs.existsSync(TOKEN_VALUES_JSON)) {
    return JSON.parse(fs.readFileSync(TOKEN_VALUES_JSON, 'utf8'));
  }

  // Generate it now
  const values = loadSemanticTokenValues();
  fs.writeFileSync(TOKEN_VALUES_JSON, JSON.stringify(values, null, 2));
  return values;
}

const SEMANTIC_TOKENS = ensureTokenValuesFile(); // e.g. { primary: '#6366F1', ... }

/* ---------------------------------------------------------------------------
 * Helper: Load whitelist (class names) – keep it in sync automatically
 * --------------------------------------------------------------------------- */
function loadWhitelist() {
  if (!fs.existsSync(WHITELIST_FILE)) {
    // Auto‑populate with the currently known semantic prefixes + a few primitives
    const initial = Array.from(SEMANTIC_PREFIXES).map(p => `${p}button`).concat(
      ['c-card', 'c-input', 'c-icon', 'c-header', 'c-footer', 'c-title',
       'c-text', 'c-link', 'c-primary', 'c-secondary', 'c-success',
       'c-warning', 'c-danger', 'c-info', 'c-spacing', 'c-shadow',
       'c-radius', 'c-emphasis', 'c-textarea', 'c-badge', 'c-modal',
       'c-select', 'c-spinner', 'c-theme-toggle', 'c-tooltip']
    );
    fs.writeFileSync(WHITELIST_FILE, initial.map(c => c.replace(/^c-/, 'c-')).join('\n'));
  }
  const content = fs.readFileSync(WHITELIST_FILE, 'utf8');
  return new Set(content.split('\n').map(l => l.trim()).filter(Boolean));
}

/* ---------------------------------------------------------------------------
 * Issue detectors
 * --------------------------------------------------------------------------- */

/**
 * 1️⃣ Find inline style attributes that contain a hard‑coded hex colour.
 *    If the hex maps to a known semantic token, it is considered *allowed*.
 *
 * @returns {Array<{file:string, line:number, snippet:string, token?:string}>}
 */
function findInlineHardCodedColors() {
  const regex = /style\s*=\s*{[^}]*#[0-9A-Fa-f]{3,6}[^}]*}/g;
  const results = [];

  // Walk all *.tsx files under src/
  const walk = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...walk(path.join(fullPath, '..'))); // go up to src root
      } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        let match;
        while ((match = regex.exec(content)) !== null) {
          const snippet = match[0];
          const line = content.substr(0, match.index).split('\n').length;
          // Extract the hex value
          const hexMatch = snippet.match(/#([0-9A-Fa-f]{3,6})/);
          const hex = hexMatch ? hexMatch[1].toLowerCase() : null;
          let token = null;
          if (hex) {
            // Find the semantic token name that has this value
            const tokenName = Object.keys(SEMANTIC_TOKENS).find(k => SEMANTIC_TOKENS[k].toLowerCase() === `#${hex}`);
            if (tokenName) token = tokenName;
          }
          results.push({
            file: fullPath,
            line,
            snippet,
            token,
          });
        }
      }
    }
  };
  walk(path.join(__dirname, '..', '..', 'frontend', 'src'));
  return results;
}

/**
 * 2️⃣ Detect className usage that violates the naming convention.
 *
 * @returns {Array<{file:string, line:number, snippet:string, offendingClass:string}>}
 */
function findUnwhitelistedOrNonPrefixedClasses() {
  const whitelist = loadWhitelist();
  const results = [];

  const walk = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...walk(path.join(fullPath, '..')));
      } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const classNameRe = /className\s*=\s*{[^}]*}/g;
        let match;
        while ((match = classNameRe.exec(content)) !== null) {
          const inner = match[0].match(/{(.*)}/)[1];
          const classes = inner.split(' ').map(c => c.trim().replace(/[\"']/g, ''));
          classes.forEach(cls => {
            // If the class is NOT in the whitelist, flag it
            if (!whitelist.has(cls)) {
              results.push({
                file: fullPath,
                line: content.substr(0, match.index).split('\n').length,
                snippet: match[0].trim(),
                offendingClass: cls,
              });
            } else {
              // Enforce prefix rule for whitelisted entries
              const prefix = cls.slice(0, cls.indexOf('-') + 1);
              if (!SEMANTIC_PREFIXES.has(prefix)) {
                results.push({
                  file: fullPath,
                  line: content.substr(0, match.index).split('\n').length,
                  snippet: match[0].trim(),
                  offendingClass: cls,
                  note: `Class does not start with an allowed semantic prefix (${Array.from(SEMANTIC_PREFIXES).join(', ')})`,
                });
              }
            }
          });
        }
      }
    }
  };
  walk(path.join(__dirname, '..', '..', 'frontend', 'src'));
  return results;
}

/* ---------------------------------------------------------------------------
 * Reporting
 * --------------------------------------------------------------------------- */
function report() {
  console.log('🔎 Running enhanced style‑consistency check…\n');

  // ----- 1️⃣ Hard‑coded colour detection -----
  const colourIssues = findInlineHardCodedColors();
  if (colourIssues.length) {
    console.log('⚠️  Potential inline style with hard‑coded colours found:');
    colourIssues.forEach(i => {
      const tokenInfo = i.token ? ` (maps to semantic token \`--${i.token}\`) ` : '';
      console.log(`  - ${i.file}:${i.line} → ${i.snippet}${tokenInfo}`);
    });
    console.log('\n💡 Fix: replace the literal with the appropriate semantic token reference (e.g., className="c-' + i.token + '-bg") or add the colour to the token map if it is a new custom colour.\n');
  } else {
    console.log('✅ No un‑mapped hard‑coded colour patterns detected.\n');
  }

  // ----- 2️⃣ Class naming & prefix enforcement -----
  const classIssues = findUnwhitelistedOrNonPrefixedClasses();
  if (classIssues.length) {
    console.log('⚠️  Class name issues detected:');
    classIssues.forEach(i => {
      const prefixNote = i.note ? ' ' + i.note : '';
      console.log(`  ${i.file}:${i.line} → ${i.snippet}  // ← un‑whitelisted or non‑prefixed class “${i.offendingClass}”${prefixNote}`);
    });
    console.log('\n💡 Fix: either add the class to whitelist.txt or rename it\n' +
      `   to use one of the allowed prefixes (${Array.from(SEMANTIC_PREFIXES).join(', ')}).\n`);
  } else {
    console.log('✅ All class names are whitelisted and follow the prefix convention.\n');
  }

  console.log('✅ Enhanced style‑consistency check completed.');
}

/* ---------------------------------------------------------------------------
 * Entry point
 * --------------------------------------------------------------------------- */
if (require.main === module) {
  report();
}

/* Export for potential programmatic use */
module.exports = {
  findInlineHardCodedColors,
  findUnwhitelistedOrNonPrefixedClasses,
};