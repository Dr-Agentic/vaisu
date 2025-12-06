# Quick Start - Progressive Rendering

## What Changed

### User Experience
1. **Upload document** → Structured view appears instantly
2. **Wait ~10 seconds** → TLDR + Executive Summary appear
3. **Background** → Other visualizations generate
4. **On-demand** → Click to load additional visualizations

### Priority Order
```
Immediate:  Structured View (document outline)
    ↓
30% done:   TLDR + Executive Summary
    ↓
100% done:  All other visualizations available
```

## Test It

1. Go to http://localhost:5173/
2. Upload `test-progress.txt`
3. Watch the progressive loading:
   - Structured view shows immediately
   - TLDR appears at ~30%
   - Executive Summary appears at ~30%
   - Progress bar continues in background

## Key Files Modified
- `textAnalyzer.ts` - Prioritized TLDR/summary first
- `documentStore.ts` - Progressive result updates
- `App.tsx` - Show content as soon as available
- `documents.ts` - Partial results in progress API
