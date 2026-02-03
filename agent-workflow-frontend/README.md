# Agent Workflow Frontend

A production-ready React + TypeScript SPA for visualizing agent workflow plans. Describe your workflow in plain English and get an interactive visual graph with exportable specs.

![Agent Workflow Planner Screenshot](screenshot-placeholder.png)

## Features

- **Visual Workflow Canvas**: Interactive React Flow graph with pan/zoom, node selection
- **Agent Type Recognition**: Color-coded nodes by agent type (Orchestrator, Retriever, Extractor, etc.)
- **Details Panel**: Click any node to see inputs, outputs, suggested tools, and notes
- **Export Options**: Download JSON, copy Mermaid diagrams, export PNG
- **Validation**: Zod schema validation with inline warnings for plan integrity issues
- **Accessibility**: Keyboard navigation, ARIA labels, high-contrast colors

## Tech Stack

- **Build**: Vite + TypeScript
- **UI**: Chakra UI
- **Graph**: React Flow
- **Data Fetching**: TanStack Query (React Query)
- **Validation**: Zod
- **Testing**: Vitest + Testing Library
- **Lint/Format**: ESLint + Prettier

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running (see below)

### Installation

```bash
# Clone and enter directory
cd agent-workflow-frontend

# Install dependencies
npm install

# Copy environment config
cp .env.example .env

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

### Backend API

The frontend expects a backend API at `VITE_BACKEND_URL` (defaults to `http://localhost:8000`).

**Required endpoint:**

```
POST /plan
Content-Type: application/json

Request:
{ "description": "Ingest emails, classify, create tickets..." }

Response:
{
  "plan": {
    "version": "0.1",
    "title": "Support Triage Workflow",
    "description": "...",
    "agents": [...],
    "edges": [...]
  },
  "warnings": ["optional warnings"]
}
```

## Project Structure

```
agent-workflow-frontend/
├── index.html
├── src/
│   ├── main.tsx              # App entry point
│   ├── App.tsx               # Main app component
│   ├── theme.ts              # Chakra UI theme config
│   ├── components/
│   │   ├── PromptForm.tsx    # Left panel with input
│   │   ├── AgentCanvas.tsx   # React Flow canvas
│   │   ├── AgentNode.tsx     # Custom node component
│   │   ├── AgentDetailsDrawer.tsx
│   │   ├── TopBar.tsx
│   │   ├── ExportPanel.tsx
│   │   ├── WarningsBanner.tsx
│   │   └── EmptyState.tsx
│   ├── lib/
│   │   ├── types.ts          # Types + Zod schemas
│   │   ├── api.ts            # API client
│   │   ├── validators.ts     # Plan validation
│   │   ├── mermaid.ts        # Mermaid generation
│   │   └── layout.ts         # DAG layout algorithm
│   ├── hooks/
│   │   └── usePlan.ts        # React Query hook
│   ├── sample/
│   │   └── templates.ts      # Example prompts
│   ├── styles/
│   │   └── global.css
│   └── tests/
│       ├── setup.ts
│       └── App.spec.tsx
├── .env.example
├── vite.config.ts
├── tsconfig.json
├── .eslintrc.cjs
└── .prettierrc
```

## Available Scripts

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm run format   # Format with Prettier
npm run test     # Run tests
npm run test:ui  # Run tests with UI
```

## Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_BACKEND_URL=http://localhost:8000
```

### Agent Types

The planner recognizes these agent types:

| Type | Color | Description |
|------|-------|-------------|
| Orchestrator | Purple | Coordinates workflow execution |
| Retriever | Blue | Fetches data from sources |
| Extractor | Green | Parses and extracts information |
| Classifier | Orange | Categorizes or routes data |
| Generator | Pink | Creates content (LLM, templates) |
| ToolExecutor | Cyan | Calls external APIs/tools |
| HumanGate | Red | Requires human approval |
| Notifier | Gray | Sends notifications |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl/Cmd + Enter` | Submit workflow description |
| `Enter` | Open details for focused node |
| `Escape` | Close details drawer |
| `Tab` | Navigate between nodes |

## Plugging in an LLM

The current backend uses keyword matching to detect agent types. To use an LLM:

1. Create a backend that accepts the same API format
2. Use the LLM to parse the description into an `AgentPlan`
3. Point `VITE_BACKEND_URL` to your new backend

Example prompt for LLM:

```
Parse this workflow description into an AgentPlan JSON:
"${description}"

Output format:
{
  "version": "0.1",
  "title": "...",
  "description": "...",
  "agents": [{ id, name, type, summary, inputs, outputs, suggestedTools }],
  "edges": [{ from, to, data }]
}
```

## License

MIT
