# API Endpoints - Vaisu Backend (as of 2026-01-04)

This document lists all supported API endpoints for the Vaisu backend server. All endpoints are prefixed with `/api`.

## Document Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/documents/upload` | Upload a new document (file or raw text) |
| `POST` | `/api/documents/analyze` | Analyze a document and generate metadata |
| `GET`  | `/api/documents/search?q=<query>` | Search documents by query string |
| `GET`  | `/api/documents/:id` | Retrieve a document and its analysis |
| `GET`  | `/api/documents` | List all documents (with pagination) |
| `GET`  | `/api/documents/:id/full` | Retrieve a document with all associated data (falls back to in‑memory storage) |
| `GET`  | `/api/documents/:id/progress` | Get live analysis progress for a document |

### Example Request (Document ID: `1f8ef92b-eb95-4ce3-99d4-2c4cf5ffa6bd`)

```bash
# Retrieve document and analysis
curl -X GET "http://localhost:3001/api/documents/1f8ef92b-eb95-4ce3-99d4-2c4cf5ffa6bd"
```

---

## Visualization Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/documents/:id/visualizations/:type` | Generate a visualization of the specified type (e.g., `knowledge-graph`, `mind-map`, `flowchart`, `executive-dashboard`, `timeline`, `terms-definitions`, `uml-class-diagram`, `argument-map`, `depth-graph`) |
| `GET`  | `/api/documents/:id/visualizations/:type` | Retrieve an existing visualization of the specified type |
| `GET`  | `/api/documents/:id/visualizations` | List all visualizations associated with a document |
| `GET`  | `/api/documents/:id/visualizations/:type` | (Alias of above – retains for backward compatibility) |

### Example Request (Document ID: `1f8ef92b-eb95-4ce3-99d4-2c4cf5ffa6bd`)

```bash
# Generate a knowledge-graph visualization
curl -X POST "http://localhost:3001/api/documents/1f8ef92b-eb95-4ce3-99d4-2c4cf5ffa6bd/visualizations/knowledge-graph"

# Retrieve an existing visualization
curl -X GET "http://localhost:3001/api/documents/1f8ef92b-eb95-4ce3-99d4-2c4cf5ffa6bd/visualizations/knowledge-graph"
```

---

## Utility Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/health` | Health check endpoint returning status and environment |
| `GET`  | `/api/documents/:id/visualizations/:type` | Retrieve existing visualization (duplicate entry for emphasis) |
| `GET`  | `/api/documents/:id/visualizations` | Retrieve all visualizations for a document |

## Notes

- All routes are mounted under the `/api` base path.
- The `/api/documents` namespace contains all document‑related functionality.
- Visualization types include: `structured-view`, `mind-map`, `flowchart`, `knowledge-graph`, `executive-dashboard`, `timeline`, `terms-definitions`, `uml-class-diagram`, `argument-map`, `depth-graph`.
- Error responses follow the standard format: `{ error: "<message>" }`.

## Visualization Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/documents/:id/visualizations/:type` | Generate a visualization of the specified type (e.g., `knowledge-graph`, `mind-map`, `flowchart`, `executive-dashboard`, `timeline`, `terms-definitions`, `uml-class-diagram`, `argument-map`, `depth-graph`) |
| `GET`  | `/api/documents/:id/visualizations/:type` | Retrieve an existing visualization of the specified type |
| `GET`  | `/api/documents/:id/visualizations` | List all visualizations associated with a document |
| `GET`  | `/api/documents/:id/visualizations/:type` | (Alias of above – retains for backward compatibility) |

## Utility Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/health` | Health check endpoint returning status and environment |
| `GET`  | `/api/documents/:id/visualizations/:type` | Retrieve existing visualization (duplicate entry for emphasis) |
| `GET`  | `/api/documents/:id/visualizations` | Retrieve all visualizations for a document |

## Notes

- All routes are mounted under the `/api` base path.
- The `/api/documents` namespace contains all document‑related functionality.
- Visualization types include: `structured-view`, `mind-map`, `flowchart`, `knowledge-graph`, `executive-dashboard`, `timeline`, `terms-definitions`, `uml-class-diagram`, `argument-map`, `depth-graph`.
- Error responses follow the standard format: `{ error: "<message>" }`.