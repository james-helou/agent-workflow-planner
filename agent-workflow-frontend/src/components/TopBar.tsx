/**
 * TopBar Component
 *
 * Top navigation bar with:
 * - App title
 * - Export panel (JSON, Mermaid, PNG)
 * - Warning indicator
 */

import { Flex, Heading, HStack, Box, useColorModeValue } from '@chakra-ui/react';
import { ExportPanel } from './ExportPanel';
import type { AgentPlan } from '@/lib/types';

interface TopBarProps {
  plan: AgentPlan | null;
  warnings: string[];
}

export function TopBar({ plan, warnings }: TopBarProps) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      as="header"
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      px={4}
      py={2}
      role="banner"
    >
      <Flex justify="space-between" align="center">
        {/* Logo and title */}
        <HStack spacing={3}>
          <Box fontSize="xl" aria-hidden="true">
            🎯
          </Box>
          <Heading size="sm" fontWeight="600">
            Agent Workflow Planner
          </Heading>
        </HStack>

        {/* Export panel (only visible when plan exists) */}
        {plan && <ExportPanel plan={plan} warningCount={warnings.length} />}
      </Flex>
    </Box>
  );
}
