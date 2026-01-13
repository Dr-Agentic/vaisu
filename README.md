# Vaisu - Text to Visual Intelligence

Transform text documents into interactive visual representations using AI-powered analysis.

## Features

- **Document Upload**: Support for .txt, .pdf, and .md files
- **Text Input**: Paste text directly for instant analysis
- **AI Analysis**: Powered by Claude 3.7 and GPT-4.5 via OpenRouter
- **Multiple Visualizations**:
  - Structured View (default) - Document outline with summaries
  - Mind Map - Hierarchical concept visualization
  - Flowchart - Process flow diagrams
  - Knowledge Graph - Entity relationships
  - Executive Dashboard - KPIs and metrics
  - Timeline - Chronological events
  - And more...
- **TLDR & Executive Summary**: Instant insights
- **Interactive Exploration**: Zoom, pan, search, and filter
- **Export**: PDF, PNG, SVG, PPTX, HTML formats

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Zustand (state management)
- TailwindCSS
- D3.js, Cytoscape.js, React Flow (visualizations)

### Backend
- Node.js + Express
- TypeScript
- OpenRouter API (LLM access)
- PDF/DOCX parsing

## Prerequisites

- Node.js 18+ and npm
- OpenRouter API key ([get one here](https://openrouter.ai/))

## Quick Start

### 1. Clone and Install

```bash
cd vaisu
npm install
```

### 2. Configure Backend

Create `backend/.env`:

```env
PORT=7001
OPENROUTER_API_KEY=your_key_here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
APP_URL=http://localhost:7002
```

### 3. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start separately:
npm run dev:backend  # Backend on http://localhost:7001
npm run dev:frontend # Frontend on http://localhost:7002
```

### 4. Open Application

Navigate to http://localhost:7002

## Usage

1. **Upload a Document** or **Paste Text**
2. Wait for AI analysis (10-30 seconds depending on document size)
3. View **TLDR** and **Executive Summary**
4. Explore different **Visualizations**
5. **Export** your favorite views

## Project Structure

```
vaisu/
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── upload/
│   │   │   ├── summary/
│   │   │   └── visualizations/
│   │   ├── stores/
│   │   ├── services/
│   │   └── App.tsx
│   └── package.json
├── backend/           # Express backend
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   │   ├── llm/
│   │   │   ├── analysis/
│   │   │   └── visualization/
│   │   └── server.ts
│   └── package.json
├── shared/            # Shared TypeScript types
│   └── src/types.ts
└── package.json       # Root workspace config
```

## API Endpoints

- `POST /api/documents/upload` - Upload document file
- `POST /api/documents/analyze` - Analyze document or text
- `GET /api/documents/:id` - Get document details
- `POST /api/documents/:id/visualizations/:type` - Generate visualization
- `GET /api/health` - Health check

## LLM Models Used

Via OpenRouter:

- **Claude 3.7 Haiku**: Fast summaries, section analysis
- **Claude 3.7 Sonnet**: Executive summaries, relationships, recommendations
- **GPT-4.5 Mini**: Entity extraction, KPIs, signals
- **GPT-4.5**: Technical diagrams, complex analysis

## Development

### Build for Production

```bash
npm run build
```

### Run Tests

```bash
npm test
```

### Environment Variables

**Backend (.env)**:
- `PORT`: Server port (default: 7001)
- `OPENROUTER_API_KEY`: Your OpenRouter API key (required)
- `OPENROUTER_BASE_URL`: OpenRouter API URL
- `APP_URL`: Frontend URL for CORS
- `NODE_ENV`: development | production

## Troubleshooting

### "OPENROUTER_API_KEY is required"
- Make sure you've created `backend/.env` with your API key

### "Failed to upload document"
- Check file size (max 10MB)
- Ensure file type is .txt, .pdf, or .docx

### Backend not starting
- Ensure port 7001 is available
- Verify env vars are loaded
- Check DynamoDB connection
- Verify backend is running on port 7001
- Check Node.js version (18+ required)

### Frontend not connecting to backend
- Verify backend is running on port 3001
- Check Vite proxy configuration in `frontend/vite.config.ts`

## Roadmap

- [ ] Real-time collaboration
- [ ] More visualization types (UML, Gantt, etc.)
- [ ] Advanced mind map interactions
- [ ] Custom themes and branding
- [ ] User accounts and document storage
- [ ] Mobile app
- [ ] Plugin system

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR.

## Support

For issues or questions, please open a GitHub issue.
