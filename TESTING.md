# Testing Guide for Vaisu

## Manual Testing Checklist

### 1. Document Upload

- [ ] Upload .txt file (< 1MB)
- [ ] Upload .txt file (> 5MB)
- [ ] Upload .pdf file
- [ ] Upload .docx file
- [ ] Try uploading unsupported file type (.jpg, .xlsx)
- [ ] Try uploading file > 10MB
- [ ] Drag and drop file
- [ ] Click to browse and select file

**Expected Results:**
- Valid files upload successfully
- Invalid files show error message
- Loading indicator appears during upload
- Document info displays after upload

### 2. Text Input

- [ ] Paste short text (< 100 words)
- [ ] Paste medium text (100-1000 words)
- [ ] Paste long text (> 1000 words)
- [ ] Paste text with special characters
- [ ] Paste text with multiple languages
- [ ] Clear text with X button
- [ ] Word count updates correctly

**Expected Results:**
- Text area accepts all input
- Word count is accurate
- Clear button works
- Analyze button enables when text present

### 3. Analysis

- [ ] Analyze sample document
- [ ] Analyze custom text
- [ ] Check TLDR generation
- [ ] Check Executive Summary
- [ ] Verify Key Ideas (3 items)
- [ ] Verify KPIs extraction
- [ ] Verify Risks identification
- [ ] Verify Opportunities identification
- [ ] Check processing time (< 60 seconds)

**Expected Results:**
- Analysis completes successfully
- TLDR is concise (2-3 sentences)
- Executive summary has all sections
- KPIs show values and units
- Processing time is reasonable

### 4. Structured View (Default)

- [ ] Sections display in order
- [ ] Hierarchy is correct
- [ ] Summaries are generated
- [ ] Expand/collapse works
- [ ] Expand All button works
- [ ] Collapse All button works
- [ ] Section colors vary by level
- [ ] Click section to view details

**Expected Results:**
- All sections visible
- Hierarchy preserved
- Summaries are relevant
- Interactions smooth
- Colors distinguish levels

### 5. Visualization Selector

- [ ] Recommended visualizations show star icon
- [ ] Recommendations have rationale
- [ ] All visualization types listed
- [ ] Active visualization highlighted
- [ ] Click to switch visualization
- [ ] Visualization loads on switch

**Expected Results:**
- 3-5 recommendations shown
- Rationale makes sense
- Switching is instant (cached)
- Active state clear

### 6. Mind Map

- [ ] Mind map generates
- [ ] Central node visible
- [ ] Branches radiate outward
- [ ] Colors vary by level
- [ ] Node labels readable

**Expected Results:**
- Structure is hierarchical
- Layout is balanced
- Colors are distinct

### 7. Flowchart

- [ ] Flowchart generates
- [ ] Nodes show process steps
- [ ] Edges connect nodes
- [ ] Layout is top-to-bottom

**Expected Results:**
- Flow is logical
- Connections clear

### 8. Knowledge Graph

- [ ] Graph generates
- [ ] Entities shown as nodes
- [ ] Relationships shown as edges
- [ ] Node sizes vary by importance
- [ ] Colors vary by entity type

**Expected Results:**
- Entities extracted correctly
- Relationships make sense
- Layout is readable

### 9. Executive Dashboard

- [ ] Dashboard generates
- [ ] KPI tiles display
- [ ] Executive card shows
- [ ] Charts render

**Expected Results:**
- All metrics visible
- Layout is organized

### 10. Error Handling

- [ ] Invalid file type error
- [ ] File too large error
- [ ] Network error (disconnect backend)
- [ ] API key error (invalid key)
- [ ] Empty text error
- [ ] Error messages clear
- [ ] Error dismissible

**Expected Results:**
- Errors caught gracefully
- Messages are helpful
- App doesn't crash
- Can recover from errors

### 11. UI/UX

- [ ] Responsive on desktop
- [ ] Responsive on tablet
- [ ] Responsive on mobile
- [ ] Smooth animations
- [ ] Loading states clear
- [ ] Buttons have hover states
- [ ] Focus states visible (keyboard nav)
- [ ] Colors have good contrast

**Expected Results:**
- Works on all screen sizes
- Animations smooth (60fps)
- Interactive elements clear
- Accessible

### 12. Performance

- [ ] Initial load < 3 seconds
- [ ] Document upload < 2 seconds
- [ ] Analysis < 60 seconds
- [ ] Visualization switch instant (cached)
- [ ] No memory leaks (check DevTools)
- [ ] Smooth scrolling

**Expected Results:**
- Fast load times
- Responsive interactions
- No performance degradation

## Automated Testing

### Backend Tests

```bash
cd backend
npm test
```

Test coverage:
- Document parser
- Text analyzer
- OpenRouter client
- API endpoints

### Frontend Tests

```bash
cd frontend
npm test
```

Test coverage:
- Component rendering
- Store actions
- API client
- Utility functions

## Integration Testing

### Test Scenario 1: Complete Flow

1. Start application
2. Upload sample-document.txt
3. Wait for analysis
4. Verify TLDR
5. Verify Executive Summary
6. Switch to Mind Map
7. Switch to Flowchart
8. Switch back to Structured View
9. Clear document
10. Paste new text
11. Analyze again

**Expected:** All steps complete without errors

### Test Scenario 2: Error Recovery

1. Start application
2. Stop backend server
3. Try to upload document
4. Verify error message
5. Start backend server
6. Retry upload
7. Verify success

**Expected:** Graceful error handling and recovery

### Test Scenario 3: Large Document

1. Create 10,000 word document
2. Upload document
3. Wait for analysis
4. Verify all visualizations load
5. Check performance

**Expected:** Handles large documents without crashing

## API Testing

Use curl or Postman:

### Health Check

```bash
curl http://localhost:3001/api/health
```

### Upload Document

```bash
curl -X POST http://localhost:3001/api/documents/upload \
  -F "file=@sample-document.txt"
```

### Analyze Text

```bash
curl -X POST http://localhost:3001/api/documents/analyze \
  -H "Content-Type: application/json" \
  -d '{"text":"Your text here"}'
```

## Browser Compatibility

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast sufficient
- [ ] Focus indicators visible
- [ ] Alt text on images
- [ ] ARIA labels present

Tools:
- Chrome DevTools Lighthouse
- axe DevTools
- WAVE browser extension

## Security Testing

- [ ] XSS prevention
- [ ] File upload validation
- [ ] API rate limiting
- [ ] CORS configured correctly
- [ ] Environment variables secure
- [ ] No sensitive data in logs

## Load Testing

Use Apache Bench or similar:

```bash
# Test 100 requests with 10 concurrent
ab -n 100 -c 10 http://localhost:3001/api/health
```

## Bug Report Template

When you find a bug:

```markdown
**Description:**
Brief description of the issue

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Environment:**
- OS: 
- Browser:
- Node version:

**Screenshots:**
If applicable

**Logs:**
Relevant error messages
```

## Test Results

Document your test results:

| Test Category | Pass | Fail | Notes |
|--------------|------|------|-------|
| Document Upload | ✅ | ❌ | |
| Text Input | ✅ | ❌ | |
| Analysis | ✅ | ❌ | |
| Visualizations | ✅ | ❌ | |
| Error Handling | ✅ | ❌ | |
| Performance | ✅ | ❌ | |
| Accessibility | ✅ | ❌ | |

## Continuous Testing

Set up automated testing in CI/CD:

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
```
