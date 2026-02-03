/**
 * Layout Helper
 *
 * Computes React Flow node positions from an AgentPlan DAG.
 * Uses topological sorting for left-to-right (LTR) layout.
 */

import type { Node, Edge } from 'reactflow';
import type { AgentPlan, AgentNode } from './types';
import { AGENT_TYPE_COLORS } from '@/theme';

// Layout constants
const NODE_WIDTH = 260;
const NODE_HEIGHT = 90;
const HORIZONTAL_GAP = 120;
const VERTICAL_GAP = 30;

export interface LayoutResult {
  nodes: Node[];
  edges: Edge[];
}

/**
 * Converts an AgentPlan to React Flow nodes and edges with computed positions.
 *
 * Uses topological order to assign x-levels, then centers nodes vertically
 * within each level.
 */
export function planToReactFlow(plan: AgentPlan): LayoutResult {
  // Build adjacency list and in-degree map
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

  // Compute levels using Kahn's algorithm
  const levels = computeLevels(plan.agents, adjacency, inDegree);

  // Group agents by level
  const levelGroups = new Map<number, AgentNode[]>();
  for (const agent of plan.agents) {
    const level = levels.get(agent.id) || 0;
    if (!levelGroups.has(level)) {
      levelGroups.set(level, []);
    }
    levelGroups.get(level)!.push(agent);
  }

  // Compute node positions
  const nodes: Node[] = [];

  for (const [level, agents] of levelGroups) {
    const x = level * (NODE_WIDTH + HORIZONTAL_GAP);
    const totalHeight = agents.length * NODE_HEIGHT + (agents.length - 1) * VERTICAL_GAP;
    const startY = -totalHeight / 2;

    agents.forEach((agent, index) => {
      const y = startY + index * (NODE_HEIGHT + VERTICAL_GAP);

      nodes.push({
        id: agent.id,
        type: 'agentNode',
        position: { x, y },
        data: {
          ...agent,
          color: AGENT_TYPE_COLORS[agent.type],
        },
        // Enable keyboard navigation
        focusable: true,
        ariaLabel: `${agent.name} - ${agent.type}: ${agent.summary}`,
      });
    });
  }

  // Create edges
  const edges: Edge[] = plan.edges.map((edge, index) => ({
    id: `edge-${index}`,
    source: edge.from,
    target: edge.to,
    label: edge.data.replace(/_/g, ' '),
    type: 'smoothstep',
    animated: true,
    style: {
      stroke: '#64748B',
      strokeWidth: 2,
    },
    labelStyle: {
      fill: '#475569',
      fontSize: 11,
      fontWeight: 500,
    },
    labelBgStyle: {
      fill: '#F8FAFC',
      fillOpacity: 0.95,
    },
    labelBgPadding: [4, 8] as [number, number],
    labelBgBorderRadius: 4,
  }));

  return { nodes, edges };
}

/**
 * Computes the level (x-position) for each node using topological sort.
 */
function computeLevels(
  agents: AgentNode[],
  adjacency: Map<string, string[]>,
  inDegree: Map<string, number>
): Map<string, number> {
  const levels = new Map<string, number>();
  const queue: string[] = [];

  // Start with root nodes (in-degree 0)
  for (const agent of agents) {
    if ((inDegree.get(agent.id) || 0) === 0) {
      queue.push(agent.id);
      levels.set(agent.id, 0);
    }
  }

  // Process queue (BFS-style with level tracking)
  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentLevel = levels.get(current) || 0;

    for (const neighbor of adjacency.get(current) || []) {
      // Update level to max of current + 1
      const existingLevel = levels.get(neighbor) || 0;
      levels.set(neighbor, Math.max(existingLevel, currentLevel + 1));

      // Decrease in-degree
      const newDegree = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, newDegree);

      if (newDegree === 0) {
        queue.push(neighbor);
      }
    }
  }

  return levels;
}

/**
 * Calculates bounding box for fit-view calculations.
 */
export function calculateBounds(nodes: Node[]): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} {
  if (nodes.length === 0) {
    return { minX: 0, maxX: 400, minY: 0, maxY: 300 };
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
