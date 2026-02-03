/**
 * Custom Agent Node Component for React Flow
 *
 * Displays agent name, type badge/icon, and truncated summary.
 * Supports keyboard navigation and focus.
 */

import { memo, useCallback } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Box, Text, Badge, Flex, Tooltip } from '@chakra-ui/react';
import type { AgentNode as AgentNodeType } from '@/lib/types';
import { AGENT_TYPE_ICONS, AGENT_TYPE_COLOR_SCHEMES } from '@/theme';

interface AgentNodeData extends AgentNodeType {
  color: string;
}

function AgentNodeComponent({ data, selected }: NodeProps<AgentNodeData>) {
  const { name, type, summary, color, isManual, estimatedTime, owner } = data;
  const icon = AGENT_TYPE_ICONS[type];
  const colorScheme = AGENT_TYPE_COLOR_SCHEMES[type];

  return (
    <>
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: color,
          width: 10,
          height: 10,
          border: '2px solid white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      />

      {/* Node content */}
      <Box
        bg="white"
        border="2px solid"
        borderColor={selected ? color : 'gray.200'}
        borderRadius="lg"
        p={3}
        w="260px"
        boxShadow={selected ? 'lg' : 'md'}
        transition="all 0.15s ease-in-out"
        _hover={{ borderColor: color, boxShadow: 'lg' }}
        _focusVisible={{
          outline: '2px solid',
          outlineColor: 'blue.500',
          outlineOffset: '2px',
        }}
        cursor="pointer"
        role="button"
        tabIndex={0}
        aria-label={`${name} - ${type} agent`}
        aria-pressed={selected}
      >
        {/* Header with icon and type badge */}
        <Flex justify="space-between" align="center" mb={2}>
          <Flex align="center" gap={2} minW={0} flex={1}>
            <Text fontSize="lg" aria-hidden="true">
              {icon}
            </Text>
            <Tooltip label={name} placement="top" hasArrow>
              <Text fontWeight="bold" fontSize="sm" noOfLines={1} flex={1}>
                {name}
              </Text>
            </Tooltip>
          </Flex>
          <Badge colorScheme={colorScheme} fontSize="xs" variant="subtle" ml={2} flexShrink={0}>
            {type}
          </Badge>
        </Flex>

        {/* Summary */}
        <Tooltip label={summary} placement="bottom" hasArrow>
          <Text fontSize="xs" color="gray.600" noOfLines={2} lineHeight="1.4">
            {summary}
          </Text>
        </Tooltip>

        {/* Quick info bar */}
        <Flex mt={2} pt={2} borderTop="1px" borderColor="gray.100" gap={2} flexWrap="wrap">
          {/* Manual vs Automated indicator */}
          <Badge
            colorScheme={isManual ? 'orange' : 'green'}
            variant="outline"
            fontSize="10px"
          >
            {isManual ? 'Manual' : 'Automated'}
          </Badge>
          
          {/* Estimated time */}
          {estimatedTime && (
            <Badge colorScheme="gray" variant="outline" fontSize="10px">
              {estimatedTime}
            </Badge>
          )}
          
          {/* Owner/team */}
          {owner && (
            <Badge colorScheme="purple" variant="outline" fontSize="10px">
              {owner}
            </Badge>
          )}
        </Flex>
      </Box>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: color,
          width: 10,
          height: 10,
          border: '2px solid white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      />
    </>
  );
}

// Memoize to prevent unnecessary re-renders
export const AgentNodeMemo = memo(AgentNodeComponent);
