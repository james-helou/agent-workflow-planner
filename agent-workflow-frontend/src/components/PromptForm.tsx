/**
 * PromptForm Component
 *
 * Left panel with:
 * - Textarea for workflow description
 * - Example prompt buttons
 * - Plan Workflow button
 * - Token count estimate
 */

import { useState, useCallback } from 'react';
import {
  Box,
  VStack,
  Textarea,
  Button,
  Heading,
  Text,
  Divider,
  useColorModeValue,
  Flex,
  Badge,
} from '@chakra-ui/react';
import { MdPlayArrow } from 'react-icons/md';
import { EXAMPLE_TEMPLATES } from '@/sample/templates';

interface PromptFormProps {
  onSubmit: (description: string) => void;
  isLoading: boolean;
}

export function PromptForm({ onSubmit, isLoading }: PromptFormProps) {
  const [description, setDescription] = useState('');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Simple token estimate (chars / 4 is a rough approximation)
  const tokenEstimate = Math.ceil(description.length / 4);

  const handleSubmit = useCallback(() => {
    if (description.trim().length < 10) return;
    onSubmit(description);
  }, [description, onSubmit]);

  const handleExampleClick = useCallback((exampleDescription: string) => {
    setDescription(exampleDescription);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Ctrl/Cmd + Enter to submit
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <Box
      as="aside"
      w="320px"
      h="100%"
      bg={bgColor}
      borderRight="1px"
      borderColor={borderColor}
      p={4}
      overflowY="auto"
      aria-label="Workflow input panel"
    >
      <VStack spacing={4} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="md" mb={1}>
            Describe Your Workflow
          </Heading>
          <Text fontSize="sm" color="gray.500">
            Use plain English to describe what your agents should do
          </Text>
        </Box>

        <Divider />

        {/* Description textarea */}
        <Box>
          <Flex justify="space-between" align="center" mb={2}>
            <Text fontSize="sm" fontWeight="medium">
              Workflow Description
            </Text>
            <Badge colorScheme="gray" fontSize="xs" variant="subtle">
              ~{tokenEstimate} tokens
            </Badge>
          </Flex>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., Ingest support emails, extract key details, classify by severity, route critical issues to humans, create tickets, and notify via Slack..."
            rows={8}
            resize="vertical"
            fontSize="sm"
            aria-label="Workflow description"
          />
          <Text fontSize="xs" color="gray.400" mt={1}>
            Press Ctrl+Enter to submit
          </Text>
        </Box>

        {/* Plan button */}
        <Button
          colorScheme="blue"
          size="md"
          onClick={handleSubmit}
          isLoading={isLoading}
          loadingText="Planning..."
          isDisabled={description.trim().length < 10}
          leftIcon={<MdPlayArrow />}
          aria-label="Plan workflow"
        >
          Plan Workflow
        </Button>

        <Divider />

        {/* Example prompts */}
        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={2}>
            Try an Example
          </Text>
          <VStack spacing={2} align="stretch">
            {EXAMPLE_TEMPLATES.map((template) => (
              <Button
                key={template.id}
                variant="outline"
                size="sm"
                onClick={() => handleExampleClick(template.description)}
                textAlign="left"
                whiteSpace="normal"
                h="auto"
                py={2}
                justifyContent="flex-start"
                aria-label={`Load ${template.label} example`}
              >
                <VStack align="start" spacing={0}>
                  <Text fontWeight="medium">{template.label}</Text>
                  <Text fontSize="xs" color="gray.500" noOfLines={1}>
                    {template.shortDescription}
                  </Text>
                </VStack>
              </Button>
            ))}
          </VStack>
        </Box>

        <Divider />

        {/* Help text */}
        <Box>
          <Text fontSize="xs" color="gray.500">
            💡 Tip: The planner maps verbs like "fetch", "extract", "classify" to agent types.
            For production, connect an LLM backend.
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}
