/**
 * Agent Workflow Planner – Planner Logic
 *
 * This is a deterministic stub that maps common verbs to agent archetypes.
 * In production, you'd replace this with an LLM-based planner.
 */

import { AgentPlan, AgentNode, EdgeSpec, AgentType } from "./spec";

// ─────────────────────────────────────────────────────────────────────────────
// Verb → AgentType Mapping
// ─────────────────────────────────────────────────────────────────────────────

const VERB_TO_AGENT_TYPE: [RegExp, AgentType, string[]][] = [
  [/\b(ingest|fetch|collect|retrieve|get|load|pull)\b/i, "Retriever", ["API Client", "File Reader", "Database Connector"]],
  [/\b(parse|extract|scrape|read)\b/i, "Extractor", ["Text Parser", "JSON Extractor", "Regex Matcher"]],
  [/\b(decide|route|classify|categorize|score|rank|filter)\b/i, "Classifier", ["Rule Engine", "ML Classifier", "Scoring Model"]],
  [/\b(create|update|write|insert|post|put|delete|call)\b/i, "ToolExecutor", ["REST Client", "Database Writer", "Webhook Caller"]],
  [/\b(summarize|draft|write|generate|compose|create.*report)\b/i, "Generator", ["LLM", "Template Engine", "Report Builder"]],
  [/\b(approv|review|confirm|human|manual|escalate)\b/i, "HumanGate", ["Approval Queue", "Email Notification", "Slack Bot"]],
  [/\b(notify|alert|email|slack|send|message)\b/i, "Notifier", ["Email Service", "Slack API", "SMS Gateway", "Webhook"]],
  [/\b(enrich|augment|lookup|clearbit|external)\b/i, "Retriever", ["Clearbit API", "LinkedIn API", "Company Database"]],
];

// ─────────────────────────────────────────────────────────────────────────────
// Canned Templates
// ─────────────────────────────────────────────────────────────────────────────

const CANNED_TEMPLATES: Record<string, AgentPlan> = {
  "support-triage": {
    version: "0.1",
    title: "Support Ticket Triage",
    description: "Ingest support emails, extract details, classify severity, require human approval for critical, create a Jira ticket, notify Slack.",
    agents: [
      {
        id: "email-ingester",
        name: "Email Ingester",
        type: "Retriever",
        summary: "Fetches incoming support emails from the inbox",
        inputs: [{ name: "email_inbox" }],
        outputs: [{ name: "raw_email" }],
        suggestedTools: ["IMAP Client", "Gmail API"],
      },
      {
        id: "detail-extractor",
        name: "Detail Extractor",
        type: "Extractor",
        summary: "Parses email to extract sender, subject, body, and metadata",
        inputs: [{ from: "email-ingester", name: "raw_email" }],
        outputs: [{ name: "ticket_details" }],
        suggestedTools: ["NLP Parser", "Regex"],
      },
      {
        id: "severity-classifier",
        name: "Severity Classifier",
        type: "Classifier",
        summary: "Classifies ticket severity as low, medium, high, or critical",
        inputs: [{ from: "detail-extractor", name: "ticket_details" }],
        outputs: [{ name: "severity" }, { name: "classified_ticket" }],
        suggestedTools: ["ML Classifier", "Rule Engine"],
      },
      {
        id: "human-approval",
        name: "Human Approval Gate",
        type: "HumanGate",
        summary: "Routes critical tickets for human approval before action",
        inputs: [{ from: "severity-classifier", name: "classified_ticket" }],
        outputs: [{ name: "approved_ticket" }],
        suggestedTools: ["Slack Bot", "Email Notifier"],
        notes: ["Only triggered for critical severity"],
      },
      {
        id: "jira-creator",
        name: "Jira Ticket Creator",
        type: "ToolExecutor",
        summary: "Creates a Jira ticket with extracted details and severity",
        inputs: [{ from: "human-approval", name: "approved_ticket" }],
        outputs: [{ name: "jira_issue" }],
        suggestedTools: ["Jira REST API"],
      },
      {
        id: "slack-notifier",
        name: "Slack Notifier",
        type: "Notifier",
        summary: "Posts notification to the support channel with ticket link",
        inputs: [{ from: "jira-creator", name: "jira_issue" }],
        outputs: [{ name: "notification_sent" }],
        suggestedTools: ["Slack Webhook", "Slack Bot"],
      },
    ],
    edges: [
      { from: "email-ingester", to: "detail-extractor", data: "raw_email" },
      { from: "detail-extractor", to: "severity-classifier", data: "ticket_details" },
      { from: "severity-classifier", to: "human-approval", data: "classified_ticket" },
      { from: "human-approval", to: "jira-creator", data: "approved_ticket" },
      { from: "jira-creator", to: "slack-notifier", data: "jira_issue" },
    ],
    dataSchemas: {
      raw_email: { fields: ["from", "to", "subject", "body", "timestamp"] },
      ticket_details: { fields: ["sender", "subject", "description", "urgency_keywords"] },
      severity: { fields: ["level", "confidence"] },
      jira_issue: { fields: ["key", "url", "summary", "priority"] },
    },
  },
  "lead-qualification": {
    version: "0.1",
    title: "Lead Qualification Pipeline",
    description: "Collect inbound form submissions, enrich with Clearbit, score the lead, route to AE if score > 80, create a CRM record, and email a personalized intro.",
    agents: [
      {
        id: "form-collector",
        name: "Form Submission Collector",
        type: "Retriever",
        summary: "Collects inbound lead form submissions from the website",
        inputs: [{ name: "form_webhook" }],
        outputs: [{ name: "lead_submission" }],
        suggestedTools: ["Webhook Handler", "Form Parser"],
      },
      {
        id: "clearbit-enricher",
        name: "Clearbit Enricher",
        type: "Retriever",
        summary: "Enriches lead data with company and person info from Clearbit",
        inputs: [{ from: "form-collector", name: "lead_submission" }],
        outputs: [{ name: "enriched_lead" }],
        suggestedTools: ["Clearbit API", "Company Database"],
      },
      {
        id: "lead-scorer",
        name: "Lead Scorer",
        type: "Classifier",
        summary: "Scores the lead based on company size, role, and engagement signals",
        inputs: [{ from: "clearbit-enricher", name: "enriched_lead" }],
        outputs: [{ name: "scored_lead" }],
        suggestedTools: ["Scoring Model", "Rule Engine"],
      },
      {
        id: "ae-router",
        name: "AE Router",
        type: "Classifier",
        summary: "Routes high-scoring leads (>80) to an Account Executive",
        inputs: [{ from: "lead-scorer", name: "scored_lead" }],
        outputs: [{ name: "routed_lead" }],
        suggestedTools: ["Assignment Rules", "Round Robin"],
        notes: ["Leads with score <= 80 go to nurture sequence"],
      },
      {
        id: "crm-creator",
        name: "CRM Record Creator",
        type: "ToolExecutor",
        summary: "Creates or updates a lead record in the CRM",
        inputs: [{ from: "ae-router", name: "routed_lead" }],
        outputs: [{ name: "crm_record" }],
        suggestedTools: ["Salesforce API", "HubSpot API"],
      },
      {
        id: "intro-emailer",
        name: "Personalized Intro Emailer",
        type: "Generator",
        summary: "Generates and sends a personalized intro email to the lead",
        inputs: [{ from: "crm-creator", name: "crm_record" }],
        outputs: [{ name: "email_sent" }],
        suggestedTools: ["Email Template Engine", "SendGrid"],
      },
    ],
    edges: [
      { from: "form-collector", to: "clearbit-enricher", data: "lead_submission" },
      { from: "clearbit-enricher", to: "lead-scorer", data: "enriched_lead" },
      { from: "lead-scorer", to: "ae-router", data: "scored_lead" },
      { from: "ae-router", to: "crm-creator", data: "routed_lead" },
      { from: "crm-creator", to: "intro-emailer", data: "crm_record" },
    ],
    dataSchemas: {
      lead_submission: { fields: ["email", "name", "company", "message"] },
      enriched_lead: { fields: ["email", "name", "company", "title", "employees", "industry"] },
      scored_lead: { fields: ["lead", "score", "score_breakdown"] },
      crm_record: { fields: ["id", "url", "owner"] },
    },
  },
  "weekly-report": {
    version: "0.1",
    title: "Weekly Report Generator",
    description: "Fetch metrics from analytics and billing, summarize key changes, generate a short natural-language report, and email it to the team.",
    agents: [
      {
        id: "analytics-fetcher",
        name: "Analytics Metrics Fetcher",
        type: "Retriever",
        summary: "Fetches weekly metrics from the analytics platform",
        inputs: [{ name: "analytics_api" }],
        outputs: [{ name: "analytics_data" }],
        suggestedTools: ["Google Analytics API", "Mixpanel API"],
      },
      {
        id: "billing-fetcher",
        name: "Billing Metrics Fetcher",
        type: "Retriever",
        summary: "Fetches revenue and billing data from the billing system",
        inputs: [{ name: "billing_api" }],
        outputs: [{ name: "billing_data" }],
        suggestedTools: ["Stripe API", "Chargebee API"],
      },
      {
        id: "change-summarizer",
        name: "Change Summarizer",
        type: "Extractor",
        summary: "Identifies and summarizes key changes week-over-week",
        inputs: [
          { from: "analytics-fetcher", name: "analytics_data" },
          { from: "billing-fetcher", name: "billing_data" },
        ],
        outputs: [{ name: "change_summary" }],
        suggestedTools: ["Data Diff Tool", "Statistical Analyzer"],
      },
      {
        id: "report-generator",
        name: "Report Generator",
        type: "Generator",
        summary: "Generates a natural-language weekly report with key highlights",
        inputs: [{ from: "change-summarizer", name: "change_summary" }],
        outputs: [{ name: "report_draft" }],
        suggestedTools: ["LLM", "Template Engine"],
      },
      {
        id: "team-emailer",
        name: "Team Emailer",
        type: "Notifier",
        summary: "Sends the generated report to the team via email",
        inputs: [{ from: "report-generator", name: "report_draft" }],
        outputs: [{ name: "email_sent" }],
        suggestedTools: ["SendGrid", "SES"],
      },
    ],
    edges: [
      { from: "analytics-fetcher", to: "change-summarizer", data: "analytics_data" },
      { from: "billing-fetcher", to: "change-summarizer", data: "billing_data" },
      { from: "change-summarizer", to: "report-generator", data: "change_summary" },
      { from: "report-generator", to: "team-emailer", data: "report_draft" },
    ],
    dataSchemas: {
      analytics_data: { fields: ["pageviews", "sessions", "users", "conversion_rate"] },
      billing_data: { fields: ["mrr", "churn", "new_revenue", "renewals"] },
      change_summary: { fields: ["highlights", "concerns", "trends"] },
      report_draft: { fields: ["title", "body", "bullet_points"] },
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Planner Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a canned template by ID, or undefined if not found.
 */
export function getTemplate(templateId: string): AgentPlan | undefined {
  return CANNED_TEMPLATES[templateId];
}

/**
 * Parses a plain-English description and generates an AgentPlan.
 * This is a deterministic stub—replace with LLM for production.
 */
export function planFromDescription(description: string): AgentPlan {
  // Check if this matches a canned template keyword
  const lowerDesc = description.toLowerCase();
  if (lowerDesc.includes("support") && lowerDesc.includes("triage")) {
    return CANNED_TEMPLATES["support-triage"];
  }
  if (lowerDesc.includes("lead") && lowerDesc.includes("qualif")) {
    return CANNED_TEMPLATES["lead-qualification"];
  }
  if (lowerDesc.includes("weekly") && lowerDesc.includes("report")) {
    return CANNED_TEMPLATES["weekly-report"];
  }

  // Parse steps from description
  const steps = parseSteps(description);
  if (steps.length === 0) {
    // Return a minimal plan
    return {
      version: "0.1",
      title: "Custom Workflow",
      description,
      agents: [
        {
          id: "orchestrator",
          name: "Workflow Orchestrator",
          type: "Orchestrator",
          summary: "Coordinates the workflow execution",
          inputs: [{ name: "input_data" }],
          outputs: [{ name: "output_data" }],
          suggestedTools: ["Workflow Engine"],
        },
      ],
      edges: [],
    };
  }

  // Build agents from steps
  const agents: AgentNode[] = [];
  const edges: EdgeSpec[] = [];
  const dataSchemas: Record<string, { fields: string[] }> = {};

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const agentId = `agent-${i + 1}`;
    const prevAgentId = i > 0 ? `agent-${i}` : undefined;

    // Determine agent type from verb
    const { type, tools } = inferAgentType(step);
    const name = generateAgentName(step, type);
    const outputName = generateOutputName(step, i);

    const agent: AgentNode = {
      id: agentId,
      name,
      type,
      summary: capitalize(step.trim()),
      inputs: prevAgentId
        ? [{ from: prevAgentId, name: steps[i - 1] ? generateOutputName(steps[i - 1], i - 1) : "data" }]
        : [{ name: "input_data" }],
      outputs: [{ name: outputName }],
      suggestedTools: tools,
    };

    agents.push(agent);

    // Create edge from previous agent
    if (prevAgentId) {
      edges.push({
        from: prevAgentId,
        to: agentId,
        data: generateOutputName(steps[i - 1], i - 1),
      });
    }

    // Generate simple data schema
    dataSchemas[outputName] = { fields: generateFields(step, type) };
  }

  return {
    version: "0.1",
    title: generateTitle(description),
    description,
    agents,
    edges,
    dataSchemas,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function parseSteps(description: string): string[] {
  // Split by common delimiters: commas, periods, "then", "and then"
  const normalized = description
    .replace(/,\s*and\s+then\s*/gi, ", ")
    .replace(/\s+and\s+then\s+/gi, ", ")
    .replace(/\s+then\s+/gi, ", ")
    .replace(/\.\s+/g, ", ")
    .replace(/,\s*and\s+/gi, ", ");

  const parts = normalized.split(/,\s*/).filter((s) => s.trim().length > 3);
  return parts.map((p) => p.trim().replace(/\.$/, ""));
}

function inferAgentType(step: string): { type: AgentType; tools: string[] } {
  for (const [regex, agentType, tools] of VERB_TO_AGENT_TYPE) {
    if (regex.test(step)) {
      return { type: agentType, tools };
    }
  }
  // Default to Generator for unknown steps
  return { type: "Generator", tools: ["LLM", "Custom Logic"] };
}

function generateAgentName(step: string, type: AgentType): string {
  // Extract key noun/object from the step
  const words = step.split(/\s+/);
  const verb = words[0] || "";
  const object = words.slice(1, 3).join(" ") || "Data";

  return `${capitalize(verb)} ${capitalize(object)} ${type}`.substring(0, 30);
}

function generateOutputName(step: string, index: number): string {
  const words = step.toLowerCase().split(/\s+/);

  // Try to find meaningful nouns
  const nouns = ["email", "data", "ticket", "lead", "report", "record", "message", "result", "response", "notification"];
  for (const noun of nouns) {
    if (words.some((w) => w.includes(noun))) {
      return `${noun}_output`;
    }
  }

  // Generate based on verb
  const verb = words[0] || "process";
  const verbToOutput: Record<string, string> = {
    ingest: "raw_data",
    fetch: "fetched_data",
    collect: "collected_data",
    extract: "extracted_info",
    parse: "parsed_data",
    classify: "classification",
    route: "routed_data",
    score: "scored_data",
    create: "created_record",
    update: "updated_record",
    generate: "generated_content",
    summarize: "summary",
    notify: "notification",
    email: "email_sent",
    approve: "approved_data",
  };

  return verbToOutput[verb] || `step_${index + 1}_output`;
}

function generateFields(step: string, type: AgentType): string[] {
  const typeToFields: Record<AgentType, string[]> = {
    Orchestrator: ["status", "timestamp", "metadata"],
    Retriever: ["raw_content", "source", "timestamp"],
    Extractor: ["extracted_fields", "confidence", "raw_text"],
    Classifier: ["category", "score", "confidence"],
    Generator: ["generated_text", "model_used", "tokens"],
    ToolExecutor: ["result", "status_code", "api_response"],
    HumanGate: ["decision", "approver", "comments"],
    Notifier: ["sent_at", "recipient", "channel"],
  };
  return typeToFields[type] || ["data", "status"];
}

function generateTitle(description: string): string {
  // Take first few meaningful words
  const words = description.split(/\s+/).slice(0, 5);
  return capitalize(words.join(" ")).substring(0, 50) + " Workflow";
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Export example prompts for the UI
export const EXAMPLE_PROMPTS = {
  "support-triage": {
    label: "Support Triage",
    description: "Ingest support emails, extract details, classify severity, require human approval for critical, create a Jira ticket, notify Slack.",
  },
  "lead-qualification": {
    label: "Lead Qualification",
    description: "Collect inbound form submissions, enrich with Clearbit, score the lead, route to AE if score > 80, create a CRM record, and email a personalized intro.",
  },
  "weekly-report": {
    label: "Weekly Report",
    description: "Fetch metrics from analytics and billing, summarize key changes, generate a short natural-language report, and email it to the team.",
  },
};
