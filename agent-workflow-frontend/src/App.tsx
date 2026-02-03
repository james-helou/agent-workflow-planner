/**
 * App.tsx - Main Application Component
 *
 * 3-column layout:
 * - Left: PromptForm
 * - Center: AgentCanvas
 * - Right: AgentDetailsDrawer (when node selected)
 */

import { useState, useCallback } from 'react';
import { Box, Flex, useToast } from '@chakra-ui/react';
import { TopBar } from '@/components/TopBar';
import { PromptForm } from '@/components/PromptForm';
import { AgentCanvas } from '@/components/AgentCanvas';
import { AgentDetailsDrawer } from '@/components/AgentDetailsDrawer';
import { WarningsBanner } from '@/components/WarningsBanner';
import { EmptyState } from '@/components/EmptyState';
import { usePlanMutation } from '@/hooks/usePlan';
import type { AgentNode, AgentPlan } from '@/lib/types';

function App() {
  const [plan, setPlan] = useState<AgentPlan | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const toast = useToast();

  // Get selected agent from plan
  const selectedAgent: AgentNode | null =
    plan?.agents.find((a) => a.id === selectedNodeId) ?? null;

  // Plan mutation hook
  const planMutation = usePlanMutation({
    onSuccess: (data) => {
      setPlan(data.plan);
      setWarnings(data.warnings || []);
      setSelectedNodeId(null);

      if (data.warnings && data.warnings.length > 0) {
        toast({
          title: 'Plan Generated with Warnings',
          description: `${data.plan.agents.length} agents created, ${data.warnings.length} warning(s)`,
          status: 'warning',
          duration: 4000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Workflow Planned!',
          description: `Generated ${data.plan.agents.length} agents`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Planning Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  // Handle workflow submission
  const handleSubmit = useCallback(
    (description: string) => {
      planMutation.mutate(description);
    },
    [planMutation]
  );

  // Handle node selection
  const handleNodeSelect = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  }, []);

  // Handle drawer close
  const handleDrawerClose = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Escape' && selectedNodeId) {
        setSelectedNodeId(null);
      }
    },
    [selectedNodeId]
  );

  return (
    <Flex direction="column" h="100vh" w="100vw" onKeyDown={handleKeyDown}>
      {/* Top Bar */}
      <TopBar plan={plan} warnings={warnings} />

      {/* Warnings Banner */}
      {warnings.length > 0 && <WarningsBanner warnings={warnings} />}

      {/* Main Content */}
      <Flex flex={1} overflow="hidden">
        {/* Left Panel - Prompt Form */}
        <PromptForm onSubmit={handleSubmit} isLoading={planMutation.isPending} />

        {/* Center - Canvas */}
        <Box flex={1} position="relative" role="main" aria-label="Workflow canvas">
          {plan ? (
            <AgentCanvas
              plan={plan}
              onNodeSelect={handleNodeSelect}
              selectedNodeId={selectedNodeId}
            />
          ) : (
            <EmptyState />
          )}
        </Box>

        {/* Right Panel - Details Drawer */}
        {selectedAgent && (
          <AgentDetailsDrawer agent={selectedAgent} onClose={handleDrawerClose} />
        )}
      </Flex>
    </Flex>
  );
}

export default App;
