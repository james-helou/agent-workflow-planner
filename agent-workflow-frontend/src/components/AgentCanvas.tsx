/**
 * AgentCanvas Component
 *
 * React Flow canvas for visualizing the agent workflow graph.
 * Supports pan/zoom, node selection, and keyboard navigation.
 */

import { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type NodeMouseHandler,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import { Box } from '@chakra-ui/react';
import { AgentNodeMemo } from './AgentNode';
import type { AgentPlan } from '@/lib/types';
import { planToReactFlow } from '@/lib/layout';

// Register custom node types
const nodeTypes = {
  agentNode: AgentNodeMemo,
};

interface AgentCanvasProps {
  plan: AgentPlan;
  onNodeSelect: (nodeId: string | null) => void;
  selectedNodeId: string | null;
}

function AgentCanvasInner({ plan, onNodeSelect, selectedNodeId }: AgentCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();

  // Compute layout when plan changes
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = planToReactFlow(plan);
    setNodes(newNodes);
    setEdges(newEdges);

    // Fit view after layout with a small delay
    const timer = setTimeout(() => {
      fitView({ padding: 0.15, duration: 300 });
    }, 50);

    return () => clearTimeout(timer);
  }, [plan, setNodes, setEdges, fitView]);

  // Update selected state
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        selected: n.id === selectedNodeId,
      }))
    );
  }, [selectedNodeId, setNodes]);

  // Handle node click
  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      onNodeSelect(node.id);
    },
    [onNodeSelect]
  );

  // Handle pane click (deselect)
  const onPaneClick = useCallback(() => {
    onNodeSelect(null);
  }, [onNodeSelect]);

  // Handle keyboard events on nodes
  const onNodeKeyDown = useCallback(
    (event: React.KeyboardEvent, node: Node) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onNodeSelect(node.id);
      }
    },
    [onNodeSelect]
  );

  // MiniMap node color
  const nodeColor = useCallback((node: Node) => {
    return node.data?.color || '#718096';
  }, []);

  return (
    <Box flex={1} h="100%" bg="gray.50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.1}
        maxZoom={2}
        attributionPosition="bottom-right"
        proOptions={{ hideAttribution: true }}
        nodesFocusable
        edgesFocusable
      >
        <Background color="#E2E8F0" gap={20} />
        <Controls
          showInteractive={false}
          aria-label="Canvas controls"
        />
        <MiniMap
          nodeColor={nodeColor}
          maskColor="rgba(0, 0, 0, 0.08)"
          style={{ background: '#F8FAFC' }}
          aria-label="Minimap"
        />
      </ReactFlow>
    </Box>
  );
}

// Wrap with provider
export function AgentCanvas(props: AgentCanvasProps) {
  return (
    <ReactFlowProvider>
      <AgentCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
