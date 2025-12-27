# Quick Test Guide - Mind Map Visualization

## Prerequisites

- Node.js installed
- Backend and frontend servers running
- OpenRouter API key configured in `backend/.env`

## Quick Start (30 seconds)

### Option 1: Automated Test

```bash
cd vaisu
node test-mind-map.js
```

Expected output:
```
✅ Document uploaded with ID: [id]
✅ Mind map generated successfully!
✅ Total nodes in mind map: 32
✅ All tests passed!
```

### Option 2: Web Interface

1. **Start servers** (if not running):
   ```bash
   npm run dev
   ```

2. **Open browser**:
   - Navigate to http://localhost:5173

3. **Upload document**:
   - Click "Choose File" or drag `sample-document.txt`
   - OR paste text directly

4. **Wait for analysis**:
   - Progress bar shows analysis steps
   - Takes ~10-30 seconds depending on document size

5. **View mind map**:
   - Scroll to "Visualizations" section
   - Click "Mind Map" card (may have ⭐ recommended badge)
   - Interactive mind map appears

6. **Interact**:
   - **Pan:** Click and drag canvas
   - **Zoom:** Use +/- buttons (bottom-right)
   - **Details:** Click any node
   - **Reset:** Click reset button

## What to Look For

### ✅ Success Indicators

1. **Backend Running:**
   ```
   🚀 Vaisu backend server running on port 3001
   ```

2. **Frontend Running:**
   ```
   ➜  Local:   http://localhost:5173/
   ```

3. **Mind Map Rendered:**
   - Root node in center (large, indigo)
   - Child nodes arranged radially
   - Lines connecting nodes
   - Legend in top-right
   - Controls in bottom-right

4. **Interactions Work:**
   - Canvas pans when dragged
   - Zoom buttons change scale
   - Clicking nodes shows detail panel
   - Smooth animations

### ❌ Troubleshooting

**Problem:** Servers not starting
```bash
# Check if ports are in use
lsof -i :3001  # Backend
lsof -i :5173  # Frontend

# Kill processes if needed
kill -9 [PID]

# Restart
npm run dev
```

**Problem:** Mind map shows "coming soon"
- Check browser console for errors
- Verify API response has data
- Refresh page
- Clear browser cache

**Problem:** Nodes overlap or look wrong
- Try zooming out
- Check if document has proper headings
- Verify test script passes

**Problem:** No visualization options appear
- Ensure document analysis completed
- Check for API errors in browser console
- Verify backend is responding

## Sample Documents

### Good Structure (Recommended)
```markdown
# Main Title

## Section 1
Content here...

### Subsection 1.1
More content...

### Subsection 1.2
More content...

## Section 2
Content here...
```

### Poor Structure (Avoid)
```
Random text without headings
Just paragraphs
No hierarchy
```

## API Testing

### Manual API Test

```bash
# 1. Analyze document
curl -X POST http://localhost:3001/api/documents/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "# Title\n## Section 1\nContent\n## Section 2\nMore content"}' \
  | jq '.document.id'

# 2. Generate mind map (replace [ID] with actual ID)
curl -X POST http://localhost:3001/api/documents/[ID]/visualizations/mind-map \
  | jq '.data.root.children | length'
```

Expected: Number of top-level sections

## Performance Benchmarks

### Expected Timings

| Operation | Time | Notes |
|-----------|------|-------|
| Document upload | < 1s | Instant for text |
| Analysis | 10-30s | Depends on document size |
| Mind map generation | < 1s | Cached after first request |
| Initial render | < 100ms | For ~30 nodes |
| Pan/zoom | 60fps | Smooth animations |

### Document Size Limits

| Size | Nodes | Performance |
|------|-------|-------------|
| Small (< 1KB) | < 10 | Excellent |
| Medium (1-10KB) | 10-50 | Good |
| Large (10-50KB) | 50-100 | Fair |
| Very Large (> 50KB) | > 100 | May lag |

## Browser Compatibility

### Tested ✅
- Chrome 120+
- Firefox 121+

### Expected to Work ✅
- Safari 17+
- Edge 120+

### Not Supported ❌
- IE 11 (no SVG support)
- Very old browsers

## Common Issues

### Issue: "Cannot find module"
**Solution:** Install dependencies
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

### Issue: "Port already in use"
**Solution:** Change port or kill process
```bash
# Backend: Edit backend/.env
PORT=3002

# Frontend: Edit frontend/vite.config.ts
server: { port: 5174 }
```

### Issue: "API key not found"
**Solution:** Configure OpenRouter key
```bash
# Edit backend/.env
OPENROUTER_API_KEY=your_key_here
```

### Issue: Mind map is empty
**Solution:** Check document structure
- Ensure document has headings (# or ##)
- Verify analysis completed successfully
- Check browser console for errors

## Quick Verification Checklist

- [ ] Backend running on port 3001
- [ ] Frontend running on port 5173
- [ ] Test script passes (`node test-mind-map.js`)
- [ ] Browser shows mind map with nodes
- [ ] Pan/zoom controls work
- [ ] Node selection shows details
- [ ] No console errors

## Getting Help

1. **Check logs:**
   - Backend: Terminal running `npm run dev:backend`
   - Frontend: Browser console (F12)

2. **Run test script:**
   ```bash
   node test-mind-map.js
   ```

3. **Verify API:**
   ```bash
   curl http://localhost:3001/api/documents
   ```

4. **Check documentation:**
   - `MIND_MAP_FEATURE.md` - Feature details
   - `MIND_MAP_COMPLETION.md` - Implementation details

## Success Criteria

✅ **Feature is working if:**
1. Test script passes all checks
2. Mind map renders in browser
3. All interactions work smoothly
4. No console errors
5. Performance is acceptable (< 1s render)

---

**Last Updated:** December 6, 2025  
**Status:** ✅ All systems operational  
**Test Coverage:** E2E, Integration, Manual
