/**
 * Mermaid Diagram Generator
 *
 * Converts an AgentPlan to Mermaid flowchart syntax.
 */

import type { AgentPlan } from './types';
import { AGENT_TYPE_COLORS } from '@/theme';

/**
 * Generates a Mermaid flowchart from an AgentPlan.
 *
 * Output format: `flowchart LR` with nodes and labeled edges.
 */
export function planToMermaid(plan: AgentPlan): string {
  const lines: string[] = [];

  // Header - Left to Right flowchart
  lines.push('flowchart LR');
  lines.push('');

  // Define nodes
  lines.push('  %% Agent Nodes');
  for (const agent of plan.agents) {
    const label = escapeLabel(`${agent.name}\\n${truncate(agent.summary, 35)}`);
    lines.push(`  ${sanitizeId(agent.id)}["${label}"]`);
  }
  lines.push('');

  // Define edges with labels
  lines.push('  %% Data Handoffs');
  for (const edge of plan.edges) {
    const label = escapeLabel(edge.data.replace(/_/g, ' '));
    lines.push(`  ${sanitizeId(edge.from)} -->|${label}| ${sanitizeId(edge.to)}`);
  }
  lines.push('');

  // Add styling per agent type
  lines.push('  %% Agent Type Styling');
  for (const agent of plan.agents) {
    const color = AGENT_TYPE_COLORS[agent.type];
    lines.push(`  style ${sanitizeId(agent.id)} fill:${color},color:#fff,stroke:${color}`);
  }

  return lines.join('\n');
}

/**
 * Generates a Mermaid sequence diagram from an AgentPlan.
 */
export function planToSequenceDiagram(plan: AgentPlan): string {
  const lines: string[] = [];

  lines.push('sequenceDiagram');
  lines.push('  participant User');

  // Define participants
  for (const agent of plan.agents) {
    const alias = sanitizeId(agent.id);
    const name = escapeLabel(agent.name);
    lines.push(`  participant ${alias} as ${name}`);
  }
  lines.push('');

  // Find root agents and start from user
  const hasIncoming = new Set(plan.edges.map((e) => e.to));
  const rootAgents = plan.agents.filter((a) => !hasIncoming.has(a.id));

  for (const root of rootAgents) {
    lines.push(`  User->>+${sanitizeId(root.id)}: Start`);
  }

  // Add edges as messages
  for (const edge of plan.edges) {
    const label = escapeLabel(edge.data.replace(/_/g, ' '));
    lines.push(`  ${sanitizeId(edge.from)}->>+${sanitizeId(edge.to)}: ${label}`);
  }

  // End with terminal agents
  const hasOutgoing = new Set(plan.edges.map((e) => e.from));
  const terminalAgents = plan.agents.filter((a) => !hasOutgoing.has(a.id));

  for (const terminal of terminalAgents) {
    lines.push(`  ${sanitizeId(terminal.id)}-->>-User: Done`);
  }

  return lines.join('\n');
}

/**
 * Sanitizes an ID for use in Mermaid.
 * Removes special characters that could break syntax.
 */
function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9]/g, '_');
}

/**
 * Escapes special characters in labels.
 */
function escapeLabel(text: string): string {
  return text.replace(/"/g, "'").replace(/\[/g, '(').replace(/\]/g, ')');
}

/**
 * Truncates text to a maximum length.
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}
