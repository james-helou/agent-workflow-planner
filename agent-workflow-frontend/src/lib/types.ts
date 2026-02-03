/**
 * Types & Zod Schemas for Agent Workflow Planner
 *
 * Defines TypeScript types and Zod schemas for runtime validation
 * of API responses.
 */

import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// Agent Types
// ─────────────────────────────────────────────────────────────────────────────

export type AgentType =
  | 'Orchestrator'
  | 'Retriever'
  | 'Extractor'
  | 'Classifier'
  | 'Generator'
  | 'ToolExecutor'
  | 'HumanGate'
  | 'Notifier';

// ─────────────────────────────────────────────────────────────────────────────
// TypeScript Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface AgentInput {
  from?: string; // agent.id, undefined for root inputs
  name: string;
}

export interface AgentOutput {
  name: string;
}

export interface AgentNode {
  id: string;
  name: string;
  type: AgentType;
  summary: string;
  inputs: AgentInput[];
  outputs: AgentOutput[];
  suggestedTools?: string[];
  notes?: string[];
}

export interface EdgeSpec {
  from: string; // agent.id
  to: string; // agent.id
  data: string; // handoff name
}

export interface DataSchema {
  fields: string[];
}

export interface AgentPlan {
  version: '0.1';
  title: string;
  description: string;
  agents: AgentNode[];
  edges: EdgeSpec[];
  dataSchemas?: Record<string, DataSchema>;
  notes?: string[];
}

export interface PlanResponse {
  plan: AgentPlan;
  warnings?: string[];
}

export interface PlanErrorResponse {
  errors: string[];
  warnings?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Zod Schemas
// ─────────────────────────────────────────────────────────────────────────────

export const ZAgentType = z.enum([
  'Orchestrator',
  'Retriever',
  'Extractor',
  'Classifier',
  'Generator',
  'ToolExecutor',
  'HumanGate',
  'Notifier',
]);

export const ZAgentInput = z.object({
  from: z.string().optional(),
  name: z.string().min(1),
});

export const ZAgentOutput = z.object({
  name: z.string().min(1),
});

export const ZAgentNode = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: ZAgentType,
  summary: z.string().min(1),
  inputs: z.array(ZAgentInput).default([]),
  outputs: z.array(ZAgentOutput).default([]),
  suggestedTools: z.array(z.string()).optional(),
  notes: z.array(z.string()).optional(),
});

export const ZEdgeSpec = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  data: z.string().min(1),
});

export const ZDataSchema = z.object({
  fields: z.array(z.string()),
});

export const ZAgentPlan = z.object({
  version: z.literal('0.1'),
  title: z.string().min(1),
  description: z.string().min(1),
  agents: z.array(ZAgentNode).min(1),
  edges: z.array(ZEdgeSpec),
  dataSchemas: z.record(ZDataSchema).optional(),
  notes: z.array(z.string()).optional(),
});

export const ZPlanResponse = z.object({
  plan: ZAgentPlan,
  warnings: z.array(z.string()).optional(),
});

export const ZPlanErrorResponse = z.object({
  errors: z.array(z.string()),
  warnings: z.array(z.string()).optional(),
});
