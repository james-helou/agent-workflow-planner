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
        // Non-technical fields
        businessOutcome: "Ensures no support request goes unnoticed by automatically capturing all incoming emails",
        analogy: "Like a mailroom clerk who collects all the letters as they arrive",
        estimatedTime: "~1-2 seconds",
        isManual: false,
        failureAction: "Retries 3 times, then alerts the IT team via email",
        owner: "IT Operations",
        exampleInput: "Gmail inbox connection",
        exampleOutput: "Email from john@acme.com: 'My account is locked...'",
        costPerRun: "Free",
        questionAnswered: "What new support requests have come in?",
      },
      {
        id: "detail-extractor",
        name: "Detail Extractor",
        type: "Extractor",
        summary: "Parses email to extract sender, subject, body, and metadata",
        inputs: [{ from: "email-ingester", name: "raw_email" }],
        outputs: [{ name: "ticket_details" }],
        suggestedTools: ["NLP Parser", "Regex"],
        businessOutcome: "Structures messy email content into organized data that can be processed consistently",
        analogy: "Like a secretary reading a letter and filling out a standardized form",
        estimatedTime: "~2-3 seconds",
        isManual: false,
        failureAction: "Falls back to manual data entry by support staff",
        owner: "Support Team",
        exampleInput: "Raw email with subject, body, headers",
        exampleOutput: "{ sender: 'john@acme.com', issue: 'account locked', urgency_keywords: ['urgent', 'locked out'] }",
        costPerRun: "$0.001",
        questionAnswered: "What is this customer asking for?",
      },
      {
        id: "severity-classifier",
        name: "Severity Classifier",
        type: "Classifier",
        summary: "Classifies ticket severity as low, medium, high, or critical",
        inputs: [{ from: "detail-extractor", name: "ticket_details" }],
        outputs: [{ name: "severity" }, { name: "classified_ticket" }],
        suggestedTools: ["ML Classifier", "Rule Engine"],
        businessOutcome: "Prioritizes urgent issues so critical problems get immediate attention",
        analogy: "Like a triage nurse in an emergency room deciding who needs help first",
        estimatedTime: "~1 second",
        isManual: false,
        failureAction: "Defaults to 'medium' priority to ensure ticket is still processed",
        owner: "Support Team",
        exampleInput: "Ticket with urgency keywords and customer info",
        exampleOutput: "Severity: HIGH (customer is enterprise tier, mentions 'outage')",
        costPerRun: "$0.002",
        questionAnswered: "How urgent is this support request?",
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
        businessOutcome: "Adds a human safety check for high-stakes decisions to prevent costly mistakes",
        analogy: "Like a manager who must sign off on big expenses before they're approved",
        estimatedTime: "5 minutes - 4 hours (depends on reviewer availability)",
        isManual: true,
        failureAction: "Escalates to backup approver after 4 hours",
        owner: "Support Manager",
        exampleInput: "Critical ticket requiring approval",
        exampleOutput: "Approved by Sarah M. at 2:34 PM with note: 'Proceed with refund'",
        costPerRun: "Free (human time)",
        questionAnswered: "Should we proceed with this action?",
      },
      {
        id: "jira-creator",
        name: "Jira Ticket Creator",
        type: "ToolExecutor",
        summary: "Creates a Jira ticket with extracted details and severity",
        inputs: [{ from: "human-approval", name: "approved_ticket" }],
        outputs: [{ name: "jira_issue" }],
        suggestedTools: ["Jira REST API"],
        businessOutcome: "Creates a trackable record that the team can assign, update, and close",
        analogy: "Like filing a work order that gets assigned to the right repair person",
        estimatedTime: "~2-3 seconds",
        isManual: false,
        failureAction: "Creates a backup record in a spreadsheet and alerts admin",
        owner: "Support Team",
        exampleInput: "Approved ticket with all details",
        exampleOutput: "JIRA-1234 created, assigned to Support queue",
        costPerRun: "Free (Jira API)",
        questionAnswered: "Where can the team track and manage this issue?",
      },
      {
        id: "slack-notifier",
        name: "Slack Notifier",
        type: "Notifier",
        summary: "Posts notification to the support channel with ticket link",
        inputs: [{ from: "jira-creator", name: "jira_issue" }],
        outputs: [{ name: "notification_sent" }],
        suggestedTools: ["Slack Webhook", "Slack Bot"],
        businessOutcome: "Keeps the team informed in real-time so issues don't sit unnoticed",
        analogy: "Like a PA announcement letting the team know there's a new task",
        estimatedTime: "~1 second",
        isManual: false,
        failureAction: "Sends email notification as backup",
        owner: "Support Team",
        exampleInput: "Jira ticket details and link",
        exampleOutput: "Message posted to #support-tickets: 'New HIGH priority ticket JIRA-1234'",
        costPerRun: "Free",
        questionAnswered: "Has the team been notified?",
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
        businessOutcome: "Captures every potential customer inquiry so no opportunity is missed",
        analogy: "Like a receptionist who greets every visitor and takes their contact information",
        estimatedTime: "~1 second",
        isManual: false,
        failureAction: "Stores submission in backup queue and alerts marketing team",
        owner: "Marketing Ops",
        exampleInput: "Website form submission",
        exampleOutput: "{ name: 'Jane Smith', email: 'jane@bigcorp.com', company: 'BigCorp', message: 'Interested in enterprise plan' }",
        costPerRun: "Free",
        questionAnswered: "Who just expressed interest in our product?",
      },
      {
        id: "clearbit-enricher",
        name: "Clearbit Enricher",
        type: "Retriever",
        summary: "Enriches lead data with company and person info from Clearbit",
        inputs: [{ from: "form-collector", name: "lead_submission" }],
        outputs: [{ name: "enriched_lead" }],
        suggestedTools: ["Clearbit API", "Company Database"],
        businessOutcome: "Provides sales team with complete company context before they reach out",
        analogy: "Like a researcher who looks up background info on someone before a meeting",
        estimatedTime: "~2-3 seconds",
        isManual: false,
        failureAction: "Proceeds with original data, flags for manual enrichment later",
        owner: "Marketing Ops",
        exampleInput: "Basic lead info with email",
        exampleOutput: "{ ...lead, company_size: '500-1000', industry: 'Technology', title: 'VP Engineering' }",
        costPerRun: "$0.05",
        questionAnswered: "What do we know about this person and their company?",
      },
      {
        id: "lead-scorer",
        name: "Lead Scorer",
        type: "Classifier",
        summary: "Scores the lead based on company size, role, and engagement signals",
        inputs: [{ from: "clearbit-enricher", name: "enriched_lead" }],
        outputs: [{ name: "scored_lead" }],
        suggestedTools: ["Scoring Model", "Rule Engine"],
        businessOutcome: "Helps sales focus time on leads most likely to convert",
        analogy: "Like a talent scout rating prospects based on potential",
        estimatedTime: "~1 second",
        isManual: false,
        failureAction: "Assigns default score of 50 and flags for manual review",
        owner: "Sales Ops",
        exampleInput: "Enriched lead with company data",
        exampleOutput: "Score: 85 (VP title +20, company size 500+ +30, tech industry +15, engaged with content +20)",
        costPerRun: "$0.001",
        questionAnswered: "How likely is this lead to become a customer?",
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
        businessOutcome: "Ensures hot leads get immediate personal attention from the right salesperson",
        analogy: "Like a dispatcher assigning the best available driver to a VIP pickup",
        estimatedTime: "~1 second",
        isManual: false,
        failureAction: "Routes to general sales queue",
        owner: "Sales Ops",
        exampleInput: "Lead with score 85",
        exampleOutput: "Assigned to: Sarah Johnson (AE, West Coast, Tech vertical)",
        costPerRun: "Free",
        questionAnswered: "Who should handle this lead?",
      },
      {
        id: "crm-creator",
        name: "CRM Record Creator",
        type: "ToolExecutor",
        summary: "Creates or updates a lead record in the CRM",
        inputs: [{ from: "ae-router", name: "routed_lead" }],
        outputs: [{ name: "crm_record" }],
        suggestedTools: ["Salesforce API", "HubSpot API"],
        businessOutcome: "Creates a single source of truth for all lead information and activity",
        analogy: "Like opening a new patient file at a doctor's office",
        estimatedTime: "~2 seconds",
        isManual: false,
        failureAction: "Stores in backup system and creates CRM record in next sync",
        owner: "Sales Ops",
        exampleInput: "Lead with routing assignment",
        exampleOutput: "Salesforce Lead ID: 00Q5g00000ABC123, Owner: Sarah Johnson",
        costPerRun: "Free (Salesforce API)",
        questionAnswered: "Where is all this lead's information stored?",
      },
      {
        id: "intro-emailer",
        name: "Personalized Intro Emailer",
        type: "Generator",
        summary: "Generates and sends a personalized intro email to the lead",
        inputs: [{ from: "crm-creator", name: "crm_record" }],
        outputs: [{ name: "email_sent" }],
        suggestedTools: ["Email Template Engine", "SendGrid"],
        businessOutcome: "Makes a great first impression with a relevant, personalized message",
        analogy: "Like a salesperson writing a thoughtful handwritten note",
        estimatedTime: "~3-5 seconds",
        isManual: false,
        failureAction: "Queues email for manual send and alerts AE",
        owner: "Sales Team",
        exampleInput: "CRM record with lead details",
        exampleOutput: "Email sent: 'Hi Jane, I noticed BigCorp is scaling its engineering team...'",
        costPerRun: "$0.003",
        questionAnswered: "Has the lead received a personalized response?",
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
        businessOutcome: "Gathers traffic and engagement data to understand how users interact with the product",
        analogy: "Like checking the visitor log at a store to see foot traffic",
        estimatedTime: "~5-10 seconds",
        isManual: false,
        failureAction: "Uses cached data from previous week and notes data may be stale",
        owner: "Data Team",
        exampleInput: "Analytics API connection for date range",
        exampleOutput: "{ pageviews: 125000, sessions: 45000, users: 32000, conversion_rate: 3.2% }",
        costPerRun: "Free",
        questionAnswered: "How much traffic did we get this week?",
      },
      {
        id: "billing-fetcher",
        name: "Billing Metrics Fetcher",
        type: "Retriever",
        summary: "Fetches revenue and billing data from the billing system",
        inputs: [{ name: "billing_api" }],
        outputs: [{ name: "billing_data" }],
        suggestedTools: ["Stripe API", "Chargebee API"],
        businessOutcome: "Provides accurate financial data for revenue tracking and forecasting",
        analogy: "Like counting the cash register at the end of the day",
        estimatedTime: "~5-10 seconds",
        isManual: false,
        failureAction: "Uses cached data and flags finance team for manual verification",
        owner: "Finance Team",
        exampleInput: "Stripe API connection for date range",
        exampleOutput: "{ mrr: $125,000, churn: 2.1%, new_revenue: $15,000, renewals: 45 }",
        costPerRun: "Free",
        questionAnswered: "How much revenue did we generate this week?",
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
        businessOutcome: "Highlights what changed so leadership can quickly spot trends and issues",
        analogy: "Like a financial analyst comparing this month's numbers to last month",
        estimatedTime: "~2-3 seconds",
        isManual: false,
        failureAction: "Generates raw data dump without analysis",
        owner: "Data Team",
        exampleInput: "This week and last week metrics",
        exampleOutput: "{ highlights: ['MRR up 8%', 'Conversion improved'], concerns: ['Churn up 0.5%'] }",
        costPerRun: "$0.002",
        questionAnswered: "What's different from last week?",
      },
      {
        id: "report-generator",
        name: "Report Generator",
        type: "Generator",
        summary: "Generates a natural-language weekly report with key highlights",
        inputs: [{ from: "change-summarizer", name: "change_summary" }],
        outputs: [{ name: "report_draft" }],
        suggestedTools: ["LLM", "Template Engine"],
        businessOutcome: "Transforms complex data into an easy-to-read summary for busy executives",
        analogy: "Like a journalist turning raw facts into a readable news story",
        estimatedTime: "~5-8 seconds",
        isManual: false,
        failureAction: "Falls back to bullet-point template format",
        owner: "Data Team",
        exampleInput: "Change summary with highlights and concerns",
        exampleOutput: "Weekly Report: Revenue grew 8% to $125K MRR. Watch: churn increased slightly...",
        costPerRun: "$0.01",
        questionAnswered: "What do stakeholders need to know this week?",
      },
      {
        id: "team-emailer",
        name: "Team Emailer",
        type: "Notifier",
        summary: "Sends the generated report to the team via email",
        inputs: [{ from: "report-generator", name: "report_draft" }],
        outputs: [{ name: "email_sent" }],
        suggestedTools: ["SendGrid", "SES"],
        businessOutcome: "Ensures all stakeholders receive the report without manual distribution",
        analogy: "Like an assistant who prints and distributes the memo to everyone's desk",
        estimatedTime: "~2-3 seconds",
        isManual: false,
        failureAction: "Saves report to shared drive and alerts team via Slack",
        owner: "Operations",
        exampleInput: "Report content and recipient list",
        exampleOutput: "Email sent to 12 recipients: leadership@company.com, etc.",
        costPerRun: "$0.001",
        questionAnswered: "Has everyone received the report?",
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
          businessOutcome: "Manages the overall workflow process",
          analogy: "Like a project manager coordinating different team members",
          estimatedTime: "Varies by workflow",
          isManual: false,
          failureAction: "Alerts administrator and pauses workflow",
          owner: "System",
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

    // Generate non-technical fields based on type
    const nonTechFields = generateNonTechnicalFields(step, type, i);

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
      ...nonTechFields,
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

/**
 * Generates non-technical user-friendly fields based on agent type and step.
 */
function generateNonTechnicalFields(step: string, type: AgentType, index: number): Partial<AgentNode> {
  const typeDefaults: Record<AgentType, {
    businessOutcome: string;
    analogy: string;
    estimatedTime: string;
    isManual: boolean;
    failureAction: string;
    owner: string;
    costPerRun: string;
    questionAnswered: string;
  }> = {
    Orchestrator: {
      businessOutcome: "Coordinates and manages the overall workflow process",
      analogy: "Like a project manager assigning tasks and tracking progress",
      estimatedTime: "Varies",
      isManual: false,
      failureAction: "Pauses workflow and alerts administrator",
      owner: "System",
      costPerRun: "Free",
      questionAnswered: "What's the current status of this workflow?",
    },
    Retriever: {
      businessOutcome: "Gathers the information needed for the next steps",
      analogy: "Like a researcher collecting data from various sources",
      estimatedTime: "~2-5 seconds",
      isManual: false,
      failureAction: "Retries 3 times, then uses cached data if available",
      owner: "Data Team",
      costPerRun: "Free - $0.01",
      questionAnswered: "What information do we need to collect?",
    },
    Extractor: {
      businessOutcome: "Turns messy data into structured, usable information",
      analogy: "Like reading through documents and filling out a form",
      estimatedTime: "~2-3 seconds",
      isManual: false,
      failureAction: "Falls back to manual data entry",
      owner: "Data Team",
      costPerRun: "$0.001 - $0.01",
      questionAnswered: "What specific details do we need from this data?",
    },
    Classifier: {
      businessOutcome: "Automatically categorizes or prioritizes items for appropriate handling",
      analogy: "Like a sorting machine that puts items in the right bins",
      estimatedTime: "~1-2 seconds",
      isManual: false,
      failureAction: "Assigns to default category for manual review",
      owner: "Operations Team",
      costPerRun: "$0.001 - $0.005",
      questionAnswered: "How should this item be categorized or prioritized?",
    },
    Generator: {
      businessOutcome: "Creates new content or documents automatically",
      analogy: "Like a writer drafting content based on given information",
      estimatedTime: "~5-15 seconds",
      isManual: false,
      failureAction: "Uses template-based fallback",
      owner: "Content Team",
      costPerRun: "$0.01 - $0.05",
      questionAnswered: "What content needs to be created?",
    },
    ToolExecutor: {
      businessOutcome: "Performs actions in external systems automatically",
      analogy: "Like an assistant who logs into systems and clicks buttons for you",
      estimatedTime: "~2-5 seconds",
      isManual: false,
      failureAction: "Logs action for manual execution and alerts team",
      owner: "IT Operations",
      costPerRun: "Free - $0.01",
      questionAnswered: "What action needs to happen in our other systems?",
    },
    HumanGate: {
      businessOutcome: "Ensures human oversight for important decisions",
      analogy: "Like a manager who must approve big decisions before they go through",
      estimatedTime: "Minutes to hours (depends on reviewer)",
      isManual: true,
      failureAction: "Escalates to backup approver",
      owner: "Team Lead",
      costPerRun: "Free (human time)",
      questionAnswered: "Should a human review this before proceeding?",
    },
    Notifier: {
      businessOutcome: "Keeps people informed about important events",
      analogy: "Like sending a message to let someone know something happened",
      estimatedTime: "~1-2 seconds",
      isManual: false,
      failureAction: "Tries alternate notification channel",
      owner: "Operations Team",
      costPerRun: "Free - $0.001",
      questionAnswered: "Who needs to know about this?",
    },
  };

  const defaults = typeDefaults[type] || typeDefaults.Generator;

  return {
    businessOutcome: defaults.businessOutcome,
    analogy: defaults.analogy,
    estimatedTime: defaults.estimatedTime,
    isManual: defaults.isManual,
    failureAction: defaults.failureAction,
    owner: defaults.owner,
    costPerRun: defaults.costPerRun,
    questionAnswered: defaults.questionAnswered,
  };
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
