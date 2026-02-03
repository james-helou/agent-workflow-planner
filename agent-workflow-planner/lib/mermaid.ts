/**
 * Mermaid Diagram Generator
 *
 * Converts an AgentPlan to Mermaid flowchart syntax.
 */

import { AgentPlan, AGENT_TYPE_COLORS } from "./spec";

/**
 * Generates a Mermaid flowchart from an AgentPlan.
 */
export function planToMermaid(plan: AgentPlan): string {
  const lines: string[] = [];

  // Header
  lines.push("flowchart LR");
  lines.push("");

  // Define node styles by type
  const typeStyles = new Map<string, string>();
  for (const agent of plan.agents) {
    if (!typeStyles.has(agent.type)) {
      const color = AGENT_TYPE_COLORS[agent.type];
      typeStyles.set(agent.type, color);
    }
  }

  // Define nodes
  lines.push("  %% Nodes");
  for (const agent of plan.agents) {
    // Escape special characters and truncate summary
    const label = `${agent.name}\\n${truncate(agent.summary, 40)}`;
    lines.push(`  ${sanitizeId(agent.id)}["${label}"]`);
  }
  lines.push("");

  // Define edges
  lines.push("  %% Edges");
  for (const edge of plan.edges) {
    const label = edge.data.replace(/_/g, " ");
    lines.push(
      `  ${sanitizeId(edge.from)} -->|${label}| ${sanitizeId(edge.to)}`
    );
  }
  lines.push("");

  // Add styling
  lines.push("  %% Styling");
  for (const agent of plan.agents) {
    const color = AGENT_TYPE_COLORS[agent.type];
    lines.push(`  style ${sanitizeId(agent.id)} fill:${color},color:#fff`);
  }

  return lines.join("\n");
}

/**
 * Generates a Mermaid sequence diagram from an AgentPlan.
 */
export function planToSequenceDiagram(plan: AgentPlan): string {
  const lines: string[] = [];

  lines.push("sequenceDiagram");
  lines.push(`  participant User`);

  // Define participants
  for (const agent of plan.agents) {
    lines.push(`  participant ${sanitizeId(agent.id)} as ${agent.name}`);
  }

  lines.push("");

  // Find root agents (no incoming edges)
  const hasIncoming = new Set(plan.edges.map((e) => e.to));
  const rootAgents = plan.agents.filter((a) => !hasIncoming.has(a.id));

  // Start with user triggering root agents
  for (const root of rootAgents) {
    lines.push(`  User->>+${sanitizeId(root.id)}: Start workflow`);
  }

  // Add edges as messages
  for (const edge of plan.edges) {
    lines.push(`  ${sanitizeId(edge.from)}->>+${sanitizeId(edge.to)}: ${edge.data}`);
  }

  // Find terminal agents (no outgoing edges)
  const hasOutgoing = new Set(plan.edges.map((e) => e.from));
  const terminalAgents = plan.agents.filter((a) => !hasOutgoing.has(a.id));

  // End with terminal agents returning to user
  for (const terminal of terminalAgents) {
    lines.push(`  ${sanitizeId(terminal.id)}-->>-User: Complete`);
  }

  return lines.join("\n");
}

/**
 * Sanitizes an ID for use in Mermaid (removes special characters).
 */
function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9]/g, "_");
}

/**
 * Truncates a string to a maximum length.
 */
function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + "...";
}
