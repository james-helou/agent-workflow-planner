/**
 * App Component Tests
 *
 * Basic render and integration tests.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '@/App';
import { theme } from '@/theme';

// Mock ResizeObserver for React Flow
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Create test wrapper
function createTestWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ChakraProvider theme={theme}>{children}</ChakraProvider>
      </QueryClientProvider>
    );
  };
}

describe('App', () => {
  it('renders the app title', () => {
    render(<App />, { wrapper: createTestWrapper() });
    
    expect(screen.getByText('Agent Workflow Planner')).toBeInTheDocument();
  });

  it('renders the prompt form', () => {
    render(<App />, { wrapper: createTestWrapper() });
    
    expect(screen.getByText('Describe Your Workflow')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/ingest support emails/i)).toBeInTheDocument();
  });

  it('renders example template buttons', () => {
    render(<App />, { wrapper: createTestWrapper() });
    
    expect(screen.getByText('Support Triage')).toBeInTheDocument();
    expect(screen.getByText('Lead Qualification')).toBeInTheDocument();
    expect(screen.getByText('Weekly Report')).toBeInTheDocument();
  });

  it('renders the Plan Workflow button', () => {
    render(<App />, { wrapper: createTestWrapper() });
    
    expect(screen.getByRole('button', { name: /plan workflow/i })).toBeInTheDocument();
  });

  it('shows empty state when no plan is generated', () => {
    render(<App />, { wrapper: createTestWrapper() });
    
    expect(screen.getByText(/describe your workflow in plain english/i)).toBeInTheDocument();
  });

  it('disables submit button when description is too short', () => {
    render(<App />, { wrapper: createTestWrapper() });
    
    const button = screen.getByRole('button', { name: /plan workflow/i });
    expect(button).toBeDisabled();
  });
});
