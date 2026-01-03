# Theme System & Compliance Guide (Electron UI)

> **Status:** 🟢 100% Compliant (As of Jan 2026)
> **Scope:** `frontend/src/electron/` and `frontend/src/design-system/` (Electron UI)

This guide defines the strict architectural rules for maintaining the Electron UI theme system. It ensures that the UI remains fully theme-aware (Light/Dark mode compliant) and consistent.

---

## 🚫 Strict Prohibitions

1.  **NO Hardcoded Colors:** Never use hex codes (e.g., `#FFFFFF`, `#1a1a1f`) directly in components or standard CSS files.
2.  **NO Legacy Tokens:** The "Void System" tokens (`--void-deepest`, `--void-light`, `--void-border`) are **DEPRECATED and REMOVED**. Do not use them.
3.  **NO Raw Tailwind Colors:** Avoid using Tailwind's default palette directly (e.g., `bg-gray-900`, `text-blue-500`) unless explicitly mapped to a semantic variable. Always prefer `bg-[var(--color-...)]` or configured semantic classes.

---

## ✅ Semantic Token Cheat Sheet

Use these semantic tokens instead of hardcoded values. They automatically adapt to Light/Dark mode.

| Concept | **Use This Token** | Old/Legacy Equivalent |
| :--- | :--- | :--- |
| **Page Background** | `var(--color-background-primary)` | `--void-deepest` |
| **Card Background** | `var(--color-surface-base)` | `--void-dark` |
| **Elevated Surface** | `var(--color-surface-elevated)` | `--void-light` (e.g. popovers) |
| **Primary Text** | `var(--color-text-primary)` | `--text-primary` |
| **Secondary Text** | `var(--color-text-secondary)` | `--text-secondary` |
| **Subtle Border** | `var(--color-border-subtle)` | `--void-border` |
| **Strong Border** | `var(--color-border-strong)` | `--void-border-hover` |
| **Primary Action** | `var(--color-interactive-primary-base)` | `#6366F1` |

---

## 🛠 Maintenance Workflow

### How to Add a New Color

**DO NOT** add a new variable directly to a component. Follow this flow:

1.  **Define Token (`tokens.ts`):** Add the raw hex value to `colorPalette` if it doesn't exist.
2.  **Map to Theme (`themes.ts`):** Assign that token to a semantic key in **both** `lightTheme` and `darkTheme` objects.
    *   *Example:* `brand: colorPalette.brand.500` (Light) vs `brand: colorPalette.brand.400` (Dark).
3.  **Expose to CSS (`index.css`):** Add the corresponding CSS variable to the `:root` block (for defaults/light) and the `:root[data-theme="dark"]` block.
    *   *Naming:* Use the `--color-` prefix (e.g., `--color-brand-base`).

### How to Style Components

Use the CSS variable in your Tailwind classes or `style` prop.

**Good (React/Tailwind):**
```tsx
<div className="bg-[var(--color-surface-base)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)]">
  Content
</div>
```

**Bad (Hardcoded):**
```tsx
// ❌ WRONG: Will not switch themes
<div className="bg-[#1a1a1f] border-gray-800 text-white">
  Content
</div>
```

---

## 🔍 Verification & Auditing

Before submitting changes, run these commands to ensure compliance:

### 1. Check for Legacy Void Tokens
Should return **0 results**.
```bash
grep -r "var(--void-" frontend/src/electron frontend/src/index.css
```

### 2. Check for Hardcoded Hex Values
Should return **0 results** in component files.
```bash
grep -r "#[0-9a-fA-F]\{3,6\}" frontend/src/electron
```

### 3. Check for Legacy Text Tokens
Should return **0 results** (ensure you use `color-text-` prefix).
```bash
grep -r "var(--text-" frontend/src/electron | grep -v "var(--color-text-"
```
