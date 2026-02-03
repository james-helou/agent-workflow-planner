/**
 * API Route: POST /api/plan
 *
 * Accepts a workflow description and returns an AgentPlan.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { planFromDescription, getTemplate } from "@/lib/planner";
import { ZAgentPlan, validatePlan } from "@/lib/spec";

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle OPTIONS preflight request
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Request body schema
const RequestSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters"),
  templateId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.errors.map((e) => e.message) },
        { status: 400, headers: corsHeaders }
      );
    }

    const { description, templateId } = parsed.data;

    // Get or generate plan
    let plan;
    if (templateId) {
      plan = getTemplate(templateId);
      if (!plan) {
        return NextResponse.json(
          { errors: [`Unknown template: ${templateId}`] },
          { status: 400, headers: corsHeaders }
        );
      }
    } else {
      plan = planFromDescription(description);
    }

    // Validate plan with Zod schema
    const zodResult = ZAgentPlan.safeParse(plan);
    if (!zodResult.success) {
      return NextResponse.json(
        {
          errors: zodResult.error.errors.map(
            (e) => `${e.path.join(".")}: ${e.message}`
          ),
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Run semantic validation
    const validation = validatePlan(plan);

    if (!validation.ok) {
      return NextResponse.json(
        { errors: validation.errors, warnings: validation.warnings },
        { status: 400, headers: corsHeaders }
      );
    }

    // Return successful response
    return NextResponse.json({
      plan,
      warnings: validation.warnings,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error("Plan generation error:", error);
    return NextResponse.json(
      { errors: ["Failed to generate plan. Please try again."] },
      { status: 500, headers: corsHeaders }
    );
  }
}
