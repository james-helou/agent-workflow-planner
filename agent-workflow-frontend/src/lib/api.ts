/**
 * API Client for Agent Workflow Planner
 *
 * Fetch wrapper for calling the backend planner API.
 */

import { ZPlanResponse, ZPlanErrorResponse, type PlanResponse } from './types';

// Get backend URL from environment or default
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors: string[] = []
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Calls the POST /plan endpoint to generate an agent workflow plan.
 *
 * @param description - Plain-English description of the workflow
 * @returns Promise<PlanResponse> - The generated plan and any warnings
 * @throws ApiError if the request fails or validation fails
 */
export async function createPlan(description: string): Promise<PlanResponse> {
  const url = `${BACKEND_URL}/plan`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ description }),
    });

    const data = await response.json();

    // Handle error responses
    if (!response.ok) {
      const errorResult = ZPlanErrorResponse.safeParse(data);
      if (errorResult.success) {
        throw new ApiError(
          errorResult.data.errors.join(', ') || 'Planning failed',
          response.status,
          errorResult.data.errors
        );
      }
      throw new ApiError(
        data.message || data.error || 'Unknown error occurred',
        response.status
      );
    }

    // Validate successful response with Zod
    const result = ZPlanResponse.safeParse(data);

    if (!result.success) {
      console.error('API response validation failed:', result.error);
      throw new ApiError(
        `Invalid response format: ${result.error.errors.map((e) => e.message).join(', ')}`,
        200,
        result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`)
      );
    }

    return result.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network or other errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError(
        `Cannot connect to backend at ${BACKEND_URL}. Is it running?`,
        0
      );
    }

    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      0
    );
  }
}

/**
 * Health check for the backend API
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
}
