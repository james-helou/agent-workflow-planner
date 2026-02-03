/**
 * Plan Validators
 *
 * Validates plan integrity beyond schema validation:
 * - Provider checks (every non-root input has a source)
 * - Edge reference validation (edges reference existing agents)
 * - Cycle detection using DFS
 */

import type { AgentPlan } from './types';

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates an AgentPlan for structural integrity.
 *
 * Checks:
 * 1. Every non-root input references an existing agent
 * 2. Every edge references existing agents
 * 3. No cycles in the graph
 * 4. Dangling outputs (outputs not consumed by edges)
 */
export function validatePlan(plan: AgentPlan): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const agentIds = new Set(plan.agents.map((a) => a.id));

  // 1. Check edges reference existing agents
  for (const edge of plan.edges) {
    if (!agentIds.has(edge.from)) {
      errors.push(`Edge references unknown source agent: "${edge.from}"`);
    }
    if (!agentIds.has(edge.to)) {
      errors.push(`Edge references unknown target agent: "${edge.to}"`);
    }
  }

  // 2. Check non-root inputs have providers
  for (const agent of plan.agents) {
    for (const input of agent.inputs) {
      if (input.from && !agentIds.has(input.from)) {
        errors.push(
          `Agent "${agent.name}" input "${input.name}" references unknown agent: "${input.from}"`
        );
      }
    }
  }

  // 3. Check for dangling outputs (outputs not consumed)
  const consumedOutputs = new Set(plan.edges.map((e) => `${e.from}:${e.data}`));
  for (const agent of plan.agents) {
    const hasOutgoingEdge = plan.edges.some((e) => e.from === agent.id);
    for (const output of agent.outputs) {
      const key = `${agent.id}:${output.name}`;
      if (!consumedOutputs.has(key) && hasOutgoingEdge) {
        warnings.push(`Agent "${agent.name}" output "${output.name}" is not consumed by any edge`);
      }
    }
  }

  // 4. Detect cycles using DFS
  if (hasCycle(plan)) {
    errors.push('The workflow contains a cycle, which is not allowed');
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Detects cycles in the agent graph using DFS.
 */
function hasCycle(plan: AgentPlan): boolean {
  const adjacency = new Map<string, string[]>();

  // Build adjacency list
  for (const agent of plan.agents) {
    adjacency.set(agent.id, []);
  }
  for (const edge of plan.edges) {
    adjacency.get(edge.from)?.push(edge.to);
  }

  const visited = new Set<string>();
  const recStack = new Set<string>();

  function dfs(node: string): boolean {
    visited.add(node);
    recStack.add(node);

    for (const neighbor of adjacency.get(node) || []) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (recStack.has(neighbor)) {
        return true;
      }
    }

    recStack.delete(node);
    return false;
  }

  for (const agent of plan.agents) {
    if (!visited.has(agent.id)) {
      if (dfs(agent.id)) return true;
    }
  }

  return false;
}

/**
 * Checks if a plan is empty or has no meaningful content.
 */
export function isPlanEmpty(plan: AgentPlan | null): boolean {
  if (!plan) return true;
  return plan.agents.length === 0;
}

/**
 * Gets the root agents (agents with no incoming edges).
 */
export function getRootAgents(plan: AgentPlan): string[] {
  const hasIncoming = new Set(plan.edges.map((e) => e.to));
  return plan.agents.filter((a) => !hasIncoming.has(a.id)).map((a) => a.id);
}

/**
 * Gets the terminal agents (agents with no outgoing edges).
 */
export function getTerminalAgents(plan: AgentPlan): string[] {
  const hasOutgoing = new Set(plan.edges.map((e) => e.from));
  return plan.agents.filter((a) => !hasOutgoing.has(a.id)).map((a) => a.id);
}
