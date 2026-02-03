/**
 * usePlan Hook
 *
 * React Query mutation hook for calling the plan API.
 */

import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { createPlan, ApiError } from '@/lib/api';
import { validatePlan } from '@/lib/validators';
import type { PlanResponse } from '@/lib/types';

type PlanMutationOptions = Omit<
  UseMutationOptions<PlanResponse, ApiError, string>,
  'mutationFn'
>;

/**
 * Custom hook for the plan mutation.
 *
 * Calls the backend API and validates the response.
 */
export function usePlanMutation(options?: PlanMutationOptions) {
  return useMutation<PlanResponse, ApiError, string>({
    mutationFn: async (description: string) => {
      // Call API
      const response = await createPlan(description);

      // Validate plan integrity
      const validation = validatePlan(response.plan);

      // Merge warnings
      const allWarnings = [...(response.warnings || []), ...validation.warnings];

      // Throw if critical errors
      if (!validation.ok) {
        throw new ApiError(
          validation.errors.join(', '),
          400,
          validation.errors
        );
      }

      return {
        plan: response.plan,
        warnings: allWarnings.length > 0 ? allWarnings : undefined,
      };
    },
    ...options,
  });
}
