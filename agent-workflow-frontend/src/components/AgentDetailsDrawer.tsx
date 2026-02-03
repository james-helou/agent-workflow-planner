/**
 * AgentDetailsDrawer Component
 *
 * Right drawer showing details of the selected agent node.
 * Includes: summary, inputs, outputs, suggested tools, notes.
 */

import {
  Box,
  VStack,
  Heading,
  Text,
  Badge,
  Divider,
  List,
  ListItem,
  ListIcon,
  Flex,
  IconButton,
  useColorModeValue,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { MdInput, MdOutput, MdBuild, MdNotes, MdInfo } from 'react-icons/md';
import type { AgentNode } from '@/lib/types';
import { AGENT_TYPE_COLORS, AGENT_TYPE_ICONS, AGENT_TYPE_COLOR_SCHEMES } from '@/theme';

interface AgentDetailsDrawerProps {
  agent: AgentNode;
  onClose: () => void;
}

export function AgentDetailsDrawer({ agent, onClose }: AgentDetailsDrawerProps) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const icon = AGENT_TYPE_ICONS[agent.type];
  const color = AGENT_TYPE_COLORS[agent.type];
  const colorScheme = AGENT_TYPE_COLOR_SCHEMES[agent.type];

  return (
    <Box
      as="aside"
      w="320px"
      h="100%"
      bg={bgColor}
      borderLeft="1px"
      borderColor={borderColor}
      p={4}
      overflowY="auto"
      role="complementary"
      aria-label={`Details for ${agent.name}`}
    >
      <VStack spacing={4} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="flex-start">
          <Box>
            <Flex align="center" gap={2} mb={1}>
              <Text fontSize="2xl" aria-hidden="true">
                {icon}
              </Text>
              <Heading size="md">{agent.name}</Heading>
            </Flex>
            <Badge colorScheme={colorScheme} fontSize="sm">
              {agent.type}
            </Badge>
          </Box>
          <IconButton
            aria-label="Close details panel"
            icon={<CloseIcon />}
            size="sm"
            variant="ghost"
            onClick={onClose}
          />
        </Flex>

        <Divider />

        {/* What it does */}
        <Box>
          <Flex align="center" gap={2} mb={2}>
            <MdInfo color={color} />
            <Heading size="sm">What it does</Heading>
          </Flex>
          <Text fontSize="sm" color="gray.600">
            {agent.summary}
          </Text>
        </Box>

        <Divider />

        {/* Inputs */}
        <Box>
          <Flex align="center" gap={2} mb={2}>
            <MdInput color="#3182CE" />
            <Heading size="sm">Inputs</Heading>
          </Flex>
          {agent.inputs.length === 0 ? (
            <Text fontSize="sm" color="gray.500" fontStyle="italic">
              No inputs (root node)
            </Text>
          ) : (
            <List spacing={1}>
              {agent.inputs.map((input, idx) => (
                <ListItem key={idx} fontSize="sm">
                  <ListIcon as={MdInput} color="blue.500" />
                  <Text as="span" fontWeight="medium">
                    {input.name}
                  </Text>
                  {input.from && (
                    <Text as="span" color="gray.500">
                      {' '}
                      (from <em>{input.from}</em>)
                    </Text>
                  )}
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        {/* Outputs */}
        <Box>
          <Flex align="center" gap={2} mb={2}>
            <MdOutput color="#38A169" />
            <Heading size="sm">Outputs</Heading>
          </Flex>
          {agent.outputs.length === 0 ? (
            <Text fontSize="sm" color="gray.500" fontStyle="italic">
              No outputs (terminal node)
            </Text>
          ) : (
            <List spacing={1}>
              {agent.outputs.map((output, idx) => (
                <ListItem key={idx} fontSize="sm">
                  <ListIcon as={MdOutput} color="green.500" />
                  <Text as="span" fontWeight="medium">
                    {output.name}
                  </Text>
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        <Divider />

        {/* Suggested Tools */}
        {agent.suggestedTools && agent.suggestedTools.length > 0 && (
          <Box>
            <Flex align="center" gap={2} mb={2}>
              <MdBuild color="#319795" />
              <Heading size="sm">Suggested Tools</Heading>
            </Flex>
            <Wrap spacing={2}>
              {agent.suggestedTools.map((tool, idx) => (
                <WrapItem key={idx}>
                  <Badge colorScheme="teal" variant="subtle">
                    {tool}
                  </Badge>
                </WrapItem>
              ))}
            </Wrap>
          </Box>
        )}

        {/* Notes */}
        {agent.notes && agent.notes.length > 0 && (
          <>
            <Divider />
            <Box>
              <Flex align="center" gap={2} mb={2}>
                <MdNotes color="#718096" />
                <Heading size="sm">Notes</Heading>
              </Flex>
              <List spacing={1}>
                {agent.notes.map((note, idx) => (
                  <ListItem key={idx} fontSize="sm" color="gray.600">
                    • {note}
                  </ListItem>
                ))}
              </List>
            </Box>
          </>
        )}

        {/* Agent ID (for debugging/reference) */}
        <Divider />
        <Box>
          <Text fontSize="xs" color="gray.400" fontFamily="mono">
            ID: {agent.id}
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}
