# Agent Workflow Planner

A visual planning tool for agent-based workflows. Describe your workflow in plain English and get a clear visual graph of agents (nodes) and data handoffs (edges), plus an exportable JSON specification.

![Agent Workflow Planner Screenshot](./docs/screenshot.png)

## Features

- **Plain English Input**: Describe your workflow naturally
- **Visual Graph**: Interactive React Flow canvas with drag/zoom
- **Agent Types**: 8 distinct agent archetypes with icons and colors
- **Details Panel**: Click any node to see inputs, outputs, tools
- **Export Options**:
  - Download JSON specification
  - Copy Mermaid flowchart/sequence diagram
  - Export canvas as PNG

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Canvas**: React Flow
- **UI**: Chakra UI
- **Validation**: Zod

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Navigate to project directory
cd agent-workflow-planner

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Project Structure

```
agent-workflow-planner/
├── app/
│   ├── api/
│   │   └── plan/
│   │       └── route.ts      # POST /api/plan endpoint
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx              # Main 3-column layout
│   └── providers.tsx         # Chakra UI provider
├── components/
│   ├── AgentCanvas.tsx       # React Flow canvas
│   ├── AgentDetailsDrawer.tsx
│   ├── AgentNode.tsx         # Custom node component
│   ├── ExportPanel.tsx
│   └── PromptForm.tsx
├── lib/
│   ├── layout.ts             # DAG → React Flow positions
│   ├── mermaid.ts            # Plan → Mermaid syntax
│   ├── planner.ts            # Stub planner logic
│   └── spec.ts               # Types + Zod schemas
├── package.json
├── tsconfig.json
└── README.md
```

## Data Model

### Agent Types

| Type | Icon | Use Case |
|------|------|----------|
| Orchestrator | 🎯 | Coordinates workflow |
| Retriever | 📥 | Fetches/ingests data |
| Extractor | 🔍 | Parses/extracts info |
| Classifier | 🏷️ | Categorizes/routes |
| Generator | ✍️ | Creates content |
| ToolExecutor | ⚙️ | Calls APIs/tools |
| HumanGate | 👤 | Requires approval |
| Notifier | 📣 | Sends notifications |

### AgentPlan Schema

```typescript
interface AgentPlan {
  version: "0.1";
  title: string;
  description: string;
  agents: AgentNode[];
  edges: EdgeSpec[];
  dataSchemas?: Record<string, { fields: string[] }>;
  notes?: string[];
}
```

See [lib/spec.ts](lib/spec.ts) for complete type definitions.

## How the Planner Works

The current planner is a **deterministic stub** that:

1. **Parses steps** from the description by splitting on commas, periods, and "then"
2. **Maps verbs to agent types**:
   - ingest/fetch → Retriever
   - parse/extract → Extractor
   - decide/classify/route → Classifier
   - create/update → ToolExecutor
   - summarize/generate → Generator
   - approve/review → HumanGate
   - notify/alert → Notifier
3. **Generates data handoffs** between consecutive agents
4. **Returns a DAG** (directed acyclic graph)

### Plugging in an LLM

To replace the stub with an LLM:

1. Edit `lib/planner.ts`
2. Replace `planFromDescription()` with an LLM call
3. Ensure the LLM returns a valid `AgentPlan` object
4. The Zod validation will catch any schema issues

Example with OpenAI:

```typescript
async function planFromDescription(description: string): Promise<AgentPlan> {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: description }
    ],
    response_format: { type: "json_object" }
  });
  
  const plan = JSON.parse(response.choices[0].message.content);
  return ZAgentPlan.parse(plan); // Validate with Zod
}
```

## Example Workflows

### Support Triage
> "Ingest support emails, extract details, classify severity, require human approval for critical, create a Jira ticket, notify Slack."

### Lead Qualification
> "Collect inbound form submissions, enrich with Clearbit, score the lead, route to AE if score > 80, create a CRM record, and email a personalized intro."

### Weekly Report
> "Fetch metrics from analytics and billing, summarize key changes, generate a short natural-language report, and email it to the team."

## Validation

The planner validates plans with:

1. **Zod schema validation** - Ensures correct structure
2. **Semantic validation** (`validatePlan()`):
   - Every edge references existing agents
   - Every non-root input has a provider
   - No cycles in the graph

Validation errors appear as toasts in the UI.

## Exports

### JSON
Downloads the `AgentPlan` object as a formatted `.json` file.

### Mermaid
Copies a Mermaid diagram to clipboard:
- **Flowchart**: LTR graph with colored nodes
- **Sequence Diagram**: Shows data flow between agents

### PNG
Exports the current canvas view as a PNG image.

## Keyboard Navigation

- **Tab**: Navigate between form elements
- **Enter**: Submit workflow
- **Click node**: Open details drawer
- **Click canvas**: Close details drawer
- **Mouse wheel**: Zoom canvas
- **Drag**: Pan canvas

## License

MIT

---

Built with ❤️ for agent orchestration planning.
