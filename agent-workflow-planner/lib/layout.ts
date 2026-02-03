/**
 * Layout Helper
 *
 * Computes React Flow node positions from an AgentPlan DAG.
 * Uses a simple left-to-right (LTR) layout based on topological order.
 */

import { Node, Edge } from "reactflow";
import { AgentPlan, AgentNode, AGENT_TYPE_COLORS } from "./spec";

// Layout constants
const NODE_WIDTH = 280;
const NODE_HEIGHT = 100;
const HORIZONTAL_GAP = 100;
const VERTICAL_GAP = 40;

export interface LayoutResult {
  nodes: Node[];
  edges: Edge[];
}

/**
 * Converts an AgentPlan to React Flow nodes and edges with computed positions.
 */
export function planToReactFlow(plan: AgentPlan): LayoutResult {
  // Build adjacency and compute levels (x positions)
  const adjacency = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const agent of plan.agents) {
    adjacency.set(agent.id, []);
    inDegree.set(agent.id, 0);
  }

  for (const edge of plan.edges) {
    adjacency.get(edge.from)?.push(edge.to);
    inDegree.set(edge.to, (inDegree.get(edge.to) || 0) + 1);
  }

  // Topological sort with level assignment
  const levels = new Map<string, number>();
  const queue: string[] = [];

  // Start with root nodes (in-degree 0)
  for (const agent of plan.agents) {
    if ((inDegree.get(agent.id) || 0) === 0) {
      queue.push(agent.id);
      levels.set(agent.id, 0);
    }
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentLevel = levels.get(current) || 0;

    for (const neighbor of adjacency.get(current) || []) {
      const newDegree = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, newDegree);

      // Set level to max of current + 1 (for LTR layout)
      const existingLevel = levels.get(neighbor) || 0;
      levels.set(neighbor, Math.max(existingLevel, currentLevel + 1));

      if (newDegree === 0) {
        queue.push(neighbor);
      }
    }
  }

  // Group agents by level
  const levelGroups = new Map<number, AgentNode[]>();
  for (const agent of plan.agents) {
    const level = levels.get(agent.id) || 0;
    if (!levelGroups.has(level)) {
      levelGroups.set(level, []);
    }
    levelGroups.get(level)!.push(agent);
  }

  // Compute positions
  const agentById = new Map(plan.agents.map((a) => [a.id, a]));
  const nodes: Node[] = [];

  for (const [level, agents] of levelGroups) {
    const x = level * (NODE_WIDTH + HORIZONTAL_GAP);

    // Center agents vertically
    const totalHeight = agents.length * NODE_HEIGHT + (agents.length - 1) * VERTICAL_GAP;
    const startY = -totalHeight / 2;

    agents.forEach((agent, index) => {
      const y = startY + index * (NODE_HEIGHT + VERTICAL_GAP);

      nodes.push({
        id: agent.id,
        type: "agentNode",
        position: { x, y },
        data: {
          ...agent,
          color: AGENT_TYPE_COLORS[agent.type],
        },
      });
    });
  }

  // Create edges
  const edges: Edge[] = plan.edges.map((edge, index) => ({
    id: `edge-${index}`,
    source: edge.from,
    target: edge.to,
    label: edge.data.replace(/_/g, " "),
    type: "smoothstep",
    animated: true,
    style: { stroke: "#718096", strokeWidth: 2 },
    labelStyle: { fill: "#4A5568", fontSize: 12, fontWeight: 500 },
    labelBgStyle: { fill: "#EDF2F7", fillOpacity: 0.9 },
    labelBgPadding: [4, 8] as [number, number],
    labelBgBorderRadius: 4,
  }));

  return { nodes, edges };
}

/**
 * Calculates the bounding box of all nodes for fit-view.
 */
export function calculateBounds(nodes: Node[]): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} {
  if (nodes.length === 0) {
    return { minX: 0, maxX: 100, minY: 0, maxY: 100 };
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const node of nodes) {
    minX = Math.min(minX, node.position.x);
    maxX = Math.max(maxX, node.position.x + NODE_WIDTH);
    minY = Math.min(minY, node.position.y);
    maxY = Math.max(maxY, node.position.y + NODE_HEIGHT);
  }

  return { minX, maxX, minY, maxY };
}
