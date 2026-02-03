/**
 * Chakra UI Theme Configuration
 *
 * Defines color schemes for agent types and global styles.
 * Uses a color-blind safe palette.
 */

import { extendTheme, type ThemeConfig } from '@chakra-ui/react';
import type { AgentType } from '@/lib/types';

// Color mode config
const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

// Agent type colors (color-blind safe palette)
export const AGENT_TYPE_COLORS: Record<AgentType, string> = {
  Orchestrator: '#7C3AED', // purple
  Retriever: '#2563EB', // blue
  Extractor: '#059669', // green
  Classifier: '#D97706', // orange/amber
  Generator: '#DB2777', // pink
  ToolExecutor: '#0891B2', // cyan
  HumanGate: '#DC2626', // red
  Notifier: '#6B7280', // gray
};

// Agent type icons (emoji)
export const AGENT_TYPE_ICONS: Record<AgentType, string> = {
  Orchestrator: '🎯',
  Retriever: '📥',
  Extractor: '🔍',
  Classifier: '🏷️',
  Generator: '✍️',
  ToolExecutor: '⚙️',
  HumanGate: '👤',
  Notifier: '📣',
};

// Chakra color scheme mapping for badges
export const AGENT_TYPE_COLOR_SCHEMES: Record<
  AgentType,
  'purple' | 'blue' | 'green' | 'orange' | 'pink' | 'cyan' | 'red' | 'gray'
> = {
  Orchestrator: 'purple',
  Retriever: 'blue',
  Extractor: 'green',
  Classifier: 'orange',
  Generator: 'pink',
  ToolExecutor: 'cyan',
  HumanGate: 'red',
  Notifier: 'gray',
};

// Custom theme
export const theme = extendTheme({
  config,
  fonts: {
    heading: 'Inter, system-ui, -apple-system, sans-serif',
    body: 'Inter, system-ui, -apple-system, sans-serif',
    mono: 'JetBrains Mono, Menlo, Monaco, monospace',
  },
  colors: {
    brand: {
      50: '#EBF5FF',
      100: '#E1EFFE',
      200: '#C3DDFD',
      300: '#A4CAFE',
      400: '#76A9FA',
      500: '#3F83F8',
      600: '#1C64F2',
      700: '#1A56DB',
      800: '#1E429F',
      900: '#233876',
    },
  },
  styles: {
    global: {
      'html, body': {
        height: '100%',
        margin: 0,
        padding: 0,
      },
      '#root': {
        height: '100%',
      },
    },
  },
  components: {
    Button: {
      defaultProps: {
        size: 'sm',
      },
    },
    Badge: {
      baseStyle: {
        fontWeight: '600',
        textTransform: 'capitalize',
      },
    },
    Drawer: {
      baseStyle: {
        dialog: {
          maxWidth: '340px',
        },
      },
    },
  },
});
