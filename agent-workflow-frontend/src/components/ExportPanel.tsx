/**
 * ExportPanel Component
 *
 * Export buttons for:
 * - Download JSON
 * - Copy Mermaid
 * - Export PNG
 */

import { useCallback } from 'react';
import {
  Button,
  HStack,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
  Tooltip,
} from '@chakra-ui/react';
import { DownloadIcon, CopyIcon, ChevronDownIcon, WarningIcon } from '@chakra-ui/icons';
import { MdImage } from 'react-icons/md';
import { toPng } from 'html-to-image';
import type { AgentPlan } from '@/lib/types';
import { planToMermaid, planToSequenceDiagram } from '@/lib/mermaid';

interface ExportPanelProps {
  plan: AgentPlan;
  warningCount: number;
}

export function ExportPanel({ plan, warningCount }: ExportPanelProps) {
  const toast = useToast();

  // Download JSON
  const handleDownloadJson = useCallback(() => {
    const json = JSON.stringify(plan, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const filename = plan.title.toLowerCase().replace(/\s+/g, '-');

    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'JSON Downloaded',
      description: `${filename}.json saved`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  }, [plan, toast]);

  // Copy Mermaid flowchart
  const handleCopyMermaidFlowchart = useCallback(async () => {
    const mermaid = planToMermaid(plan);
    await navigator.clipboard.writeText(mermaid);

    toast({
      title: 'Mermaid Copied',
      description: 'Flowchart code copied to clipboard',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  }, [plan, toast]);

  // Copy Mermaid sequence diagram
  const handleCopyMermaidSequence = useCallback(async () => {
    const mermaid = planToSequenceDiagram(plan);
    await navigator.clipboard.writeText(mermaid);

    toast({
      title: 'Mermaid Copied',
      description: 'Sequence diagram code copied to clipboard',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  }, [plan, toast]);

  // Export PNG
  const handleExportPng = useCallback(async () => {
    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;

    if (!viewport) {
      toast({
        title: 'Export Failed',
        description: 'Could not find canvas element',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const container = document.querySelector('.react-flow') as HTMLElement;

      const dataUrl = await toPng(viewport, {
        backgroundColor: '#F8FAFC',
        width: container?.clientWidth || 1200,
        height: container?.clientHeight || 800,
        style: {
          transform: 'translate(0, 0)',
        },
      });

      const filename = plan.title.toLowerCase().replace(/\s+/g, '-');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${filename}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast({
        title: 'PNG Exported',
        description: `${filename}.png saved`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('PNG export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Could not generate PNG image',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [plan, toast]);

  return (
    <HStack spacing={2}>
      {/* Warning indicator */}
      {warningCount > 0 && (
        <Tooltip label={`${warningCount} warning(s)`} placement="bottom" hasArrow>
          <Badge colorScheme="orange" variant="solid" display="flex" alignItems="center" gap={1}>
            <WarningIcon boxSize={3} />
            {warningCount}
          </Badge>
        </Tooltip>
      )}

      {/* Download JSON */}
      <Button
        size="sm"
        leftIcon={<DownloadIcon />}
        colorScheme="blue"
        variant="outline"
        onClick={handleDownloadJson}
        aria-label="Download workflow as JSON"
      >
        JSON
      </Button>

      {/* Mermaid menu */}
      <Menu>
        <MenuButton
          as={Button}
          size="sm"
          leftIcon={<CopyIcon />}
          rightIcon={<ChevronDownIcon />}
          colorScheme="green"
          variant="outline"
          aria-label="Copy as Mermaid diagram"
        >
          Mermaid
        </MenuButton>
        <MenuList>
          <MenuItem onClick={handleCopyMermaidFlowchart}>Copy Flowchart</MenuItem>
          <MenuItem onClick={handleCopyMermaidSequence}>Copy Sequence Diagram</MenuItem>
        </MenuList>
      </Menu>

      {/* Export PNG */}
      <Button
        size="sm"
        leftIcon={<MdImage />}
        colorScheme="purple"
        variant="outline"
        onClick={handleExportPng}
        aria-label="Export canvas as PNG image"
      >
        PNG
      </Button>
    </HStack>
  );
}
