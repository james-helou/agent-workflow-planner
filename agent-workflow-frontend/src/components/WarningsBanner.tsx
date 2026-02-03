/**
 * WarningsBanner Component
 *
 * Displays validation warnings from the planner API.
 */

import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  CloseButton,
  Collapse,
  VStack,
  Text,
  useDisclosure,
} from '@chakra-ui/react';

interface WarningsBannerProps {
  warnings: string[];
}

export function WarningsBanner({ warnings }: WarningsBannerProps) {
  const { isOpen, onClose } = useDisclosure({ defaultIsOpen: true });

  if (warnings.length === 0) return null;

  return (
    <Collapse in={isOpen} animateOpacity>
      <Alert status="warning" variant="subtle" px={4} py={2}>
        <AlertIcon />
        <Box flex={1}>
          <AlertTitle fontSize="sm">
            {warnings.length} Warning{warnings.length > 1 ? 's' : ''}
          </AlertTitle>
          <AlertDescription fontSize="xs">
            {warnings.length === 1 ? (
              <Text>{warnings[0]}</Text>
            ) : (
              <VStack align="start" spacing={0} mt={1}>
                {warnings.slice(0, 3).map((warning, idx) => (
                  <Text key={idx}>• {warning}</Text>
                ))}
                {warnings.length > 3 && (
                  <Text color="orange.700">...and {warnings.length - 3} more</Text>
                )}
              </VStack>
            )}
          </AlertDescription>
        </Box>
        <CloseButton
          position="relative"
          right={-1}
          top={-1}
          onClick={onClose}
          aria-label="Dismiss warnings"
        />
      </Alert>
    </Collapse>
  );
}
