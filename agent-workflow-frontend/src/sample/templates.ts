/**
 * Example Templates
 *
 * Pre-defined workflow descriptions for quick testing.
 */

export interface ExampleTemplate {
  id: string;
  label: string;
  shortDescription: string;
  description: string;
}

export const EXAMPLE_TEMPLATES: ExampleTemplate[] = [
  {
    id: 'support-triage',
    label: 'Support Triage',
    shortDescription: 'Process support emails and create tickets',
    description:
      'Ingest support emails, extract details, classify severity, require human approval for critical, create a Jira ticket, notify Slack.',
  },
  {
    id: 'lead-qualification',
    label: 'Lead Qualification',
    shortDescription: 'Qualify and route inbound leads',
    description:
      'Collect inbound form submissions, enrich with Clearbit, score the lead, route to AE if score > 80, create a CRM record, and email a personalized intro.',
  },
  {
    id: 'weekly-report',
    label: 'Weekly Report',
    shortDescription: 'Generate and send weekly metrics report',
    description:
      'Fetch metrics from analytics and billing, summarize key changes, generate a short natural-language report, and email it to the team.',
  },
];

/**
 * Get a template by ID
 */
export function getTemplateById(id: string): ExampleTemplate | undefined {
  return EXAMPLE_TEMPLATES.find((t) => t.id === id);
}
