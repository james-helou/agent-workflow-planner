/**
 * Agent Workflow Planner – Data Model & Validation
 *
 * This file defines:
 * - TypeScript types for the Agent Plan spec
 * - Zod schemas for runtime validation
 * - validatePlan() helper for semantic validation (cycles, dangling refs)
 */

import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type AgentType =
  | "Orchestrator"
  | "Retriever"
  | "Extractor"
  | "Classifier"
  | "Generator"
  | "ToolExecutor"
  | "HumanGate"
  | "Notifier";

export interface AgentNode {
  id: string;
  name: string;
  type: AgentType;
  summary: string;
  inputs: { from?: string; name: string }[];
  outputs: { name: string }[];
  suggestedTools?: string[];
  notes?: string[];
}

export interface EdgeSpec {
  from: string;
  to: string;
  data: string;
}

export interface AgentPlan {
  version: "0.1";
  title: string;
  description: string;
  agents: AgentNode[];
  edges: EdgeSpec[];
  dataSchemas?: Record<string, { fields: string[] }>;
  notes?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Zod Schemas
// ─────────────────────────────────────────────────────────────────────────────

export const ZAgentType = z.enum([
  "Orchestrator",
  "Retriever",
  "Extractor",
  "Classifier",
  "Generator",
  "ToolExecutor",
  "HumanGate",
  "Notifier",
]);

export const ZAgentInput = z.object({
  from: z.string().optional(),
  name: z.string().min(1),
});

export const ZAgentOutput = z.object({
  name: z.string().min(1),
});

export const ZAgentNode = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: ZAgentType,
  summary: z.string().min(1),
  inputs: z.array(ZAgentInput),
  outputs: z.array(ZAgentOutput),
  suggestedTools: z.array(z.string()).optional(),
  notes: z.array(z.string()).optional(),
});

export const ZEdgeSpec = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  data: z.string().min(1),
});

export const ZDataSchema = z.object({
  fields: z.array(z.string()),
});

export const ZAgentPlan = z.object({
  version: z.literal("0.1"),
  title: z.string().min(1),
  description: z.string().min(1),
  agents: z.array(ZAgentNode).min(1),
  edges: z.array(ZEdgeSpec),
  dataSchemas: z.record(ZDataSchema).optional(),
  notes: z.array(z.string()).optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Validation Result
// ─────────────────────────────────────────────────────────────────────────────

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates an AgentPlan beyond Zod schema checks:
 * - Ensures every non-root input references an existing agent
 * - Ensures every edge references existing agents
 * - Detects cycles via DFS
 */
export function validatePlan(plan: AgentPlan): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const agentIds = new Set(plan.agents.map((a) => a.id));

  // 1) Check that every edge references existing agents
  for (const edge of plan.edges) {
    if (!agentIds.has(edge.from)) {
      errors.push(`Edge references unknown 'from' agent: ${edge.from}`);
    }
    if (!agentIds.has(edge.to)) {
      errors.push(`Edge references unknown 'to' agent: ${edge.to}`);
    }
  }

  // 2) Check that every non-root input has a provider
  for (const agent of plan.agents) {
    for (const input of agent.inputs) {
      if (input.from && !agentIds.has(input.from)) {
        errors.push(
          `Agent '${agent.name}' input '${input.name}' references unknown agent: ${input.from}`
        );
      }
    }
  }

  // 3) Check for dangling outputs (outputs not consumed by any edge)
  const consumedOutputs = new Set(plan.edges.map((e) => `${e.from}:${e.data}`));
  for (const agent of plan.agents) {
    for (const output of agent.outputs) {
      const key = `${agent.id}:${output.name}`;
      if (!consumedOutputs.has(key)) {
        // Only warn if this isn't a terminal agent (has outgoing edges)
        const hasOutgoingEdge = plan.edges.some((e) => e.from === agent.id);
        if (hasOutgoingEdge) {
          warnings.push(
            `Agent '${agent.name}' output '${output.name}' is not consumed by any edge`
          );
        }
      }
    }
  }

  // 4) Detect cycles using DFS
  const adjacency = new Map<string, string[]>();
  for (const id of agentIds) {
    adjacency.set(id, []);
  }
  for (const edge of plan.edges) {
    adjacency.get(edge.from)?.push(edge.to);
  }

  const visited = new Set<string>();
  const recStack = new Set<string>();

  function hasCycle(node: string): boolean {
    visited.add(node);
    recStack.add(node);

    for (const neighbor of adjacency.get(node) || []) {
      if (!visited.has(neighbor)) {
        if (hasCycle(neighbor)) return true;
      } else if (recStack.has(neighbor)) {
        return true;
      }
    }

    recStack.delete(node);
    return false;
  }

  for (const id of agentIds) {
    if (!visited.has(id)) {
      if (hasCycle(id)) {
        errors.push("The agent graph contains a cycle, which is not allowed");
        break;
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Agent Type Colors & Icons
// ─────────────────────────────────────────────────────────────────────────────

export const AGENT_TYPE_COLORS: Record<AgentType, string> = {
  Orchestrator: "#805AD5", // purple
  Retriever: "#3182CE",    // blue
  Extractor: "#38A169",    // green
  Classifier: "#DD6B20",   // orange
  Generator: "#D53F8C",    // pink
  ToolExecutor: "#319795", // teal
  HumanGate: "#E53E3E",    // red
  Notifier: "#718096",     // gray
};

export const AGENT_TYPE_ICONS: Record<AgentType, string> = {
  Orchestrator: "🎯",
  Retriever: "📥",
  Extractor: "🔍",
  Classifier: "🏷️",
  Generator: "✍️",
  ToolExecutor: "⚙️",
  HumanGate: "👤",
  Notifier: "📣",
};
