/**
 * EmptyState Component
 *
 * Shown when no plan has been generated yet.
 */

import { Flex, VStack, Heading, Text, Box } from '@chakra-ui/react';

export function EmptyState() {
  return (
    <Flex h="100%" align="center" justify="center" bg="gray.50" role="status">
      <VStack spacing={4} color="gray.500" textAlign="center" px={8} maxW="md">
        <Box fontSize="5xl" aria-hidden="true">
          🎯
        </Box>
        <Heading size="lg" color="gray.400">
          Agent Workflow Planner
        </Heading>
        <Text>
          Describe your workflow in plain English using the panel on the left, or try one of the
          example prompts.
        </Text>
        <Text fontSize="sm" color="gray.400">
          Your workflow will appear here as an interactive graph with nodes representing agents and
          edges showing data handoffs.
        </Text>
        <VStack spacing={1} mt={4} fontSize="xs" color="gray.400">
          <Text>💡 Tip: Use verbs like "fetch", "extract", "classify", "notify"</Text>
          <Text>to help the planner identify the right agent types.</Text>
        </VStack>
      </VStack>
    </Flex>
  );
}
