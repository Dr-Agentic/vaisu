# Vaisu Quick Start Guide

Get up and running in 5 minutes!

## Step 1: Get OpenRouter API Key

1. Go to https://openrouter.ai/
2. Sign up or log in
3. Navigate to Keys section
4. Create a new API key
5. Copy the key (starts with `sk-or-...`)

## Step 2: Configure Backend

Create `backend/.env` file:

```bash
cd vaisu
cp backend/.env.example backend/.env
```

Edit `backend/.env` and add your API key:

```env
PORT=3001
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
APP_URL=http://localhost:5173
NODE_ENV=development
```

## Step 3: Install Dependencies

```bash
npm install
```

This will install dependencies for all workspaces (frontend, backend, shared).

## Step 4: Start the Application

```bash
npm run dev
```

Or use the startup script:

```bash
./start.sh
```

This starts:
- Backend server on http://localhost:3001
- Frontend app on http://localhost:5173

## Step 5: Test the Application

1. Open http://localhost:5173 in your browser
2. Try the sample document:
   - Click "or paste your text here"
   - Copy content from `sample-document.txt`
   - Paste and click "Analyze Text"
3. Wait 10-30 seconds for analysis
4. Explore the visualizations!

## Troubleshooting

### Port Already in Use

If port 3001 or 5173 is in use:

```bash
# Find and kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Find and kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### API Key Issues

Make sure your `.env` file:
- Is in the `backend/` directory
- Has no quotes around the API key
- Has the correct key format (starts with `sk-or-`)

### Module Not Found

```bash
# Clean install
rm -rf node_modules package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json
rm -rf backend/node_modules backend/package-lock.json
npm install
```

## What to Try

1. **Upload a Document**: Drag and drop a .txt, .pdf, or .docx file
2. **Paste Text**: Use the sample document or your own text
3. **Explore Visualizations**: Try different visualization types
4. **Check Recommendations**: AI suggests best visualizations
5. **Interact**: Expand/collapse sections, search, filter

## Next Steps

- Read the full [README.md](README.md)
- Check the [implementation plan](.kiro/specs/text-graphical-viewer/implementation.md)
- Explore the codebase
- Customize and extend!

## Need Help?

- Check backend logs in the terminal
- Open browser DevTools (F12) for frontend errors
- Verify API key is correct
- Ensure both servers are running

Happy visualizing! 🎉
