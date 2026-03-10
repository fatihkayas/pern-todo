import { schedules } from "@trigger.dev/sdk/v3";
import Anthropic from "@anthropic-ai/sdk";
import pool from "../db";

const JIRA_BASE_URL = process.env.JIRA_BASE_URL || "";
const JIRA_EMAIL = process.env.JIRA_EMAIL || "";
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN || "";
const JIRA_PROJECT_KEY = process.env.JIRA_PROJECT_KEY || "KAN";

interface IntegrationLog {
  id: number;
  order_id: number | null;
  service: string;
  status: string;
  payload: string;
  error_message: string | null;
  created_at: Date;
}

interface RootCauseAnalysis {
  summary: string;
  rootCauses: { category: string; count: number; description: string }[];
  affectedOrders: number[];
  recommendation: string;
  severity: "low" | "medium" | "high" | "critical";
}

async function analyzeLogsWithClaude(failures: IntegrationLog[]): Promise<RootCauseAnalysis> {
  const client = new Anthropic();

  const failureSummary = failures
    .slice(0, 50) // cap at 50 to stay within token limits
    .map(
      (f) =>
        `- order_id=${f.order_id ?? "N/A"} service=${f.service} error="${f.error_message ?? "unknown"}" time=${f.created_at.toISOString()}`
    )
    .join("\n");

  const message = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are an SRE analyzing integration failures for a watch e-commerce platform.

Here are the recent integration failures from the last hour (${failures.length} total):

${failureSummary}

Analyze these failures and respond with a JSON object (no markdown, just raw JSON) with this exact structure:
{
  "summary": "one sentence overall summary",
  "rootCauses": [
    { "category": "category name", "count": N, "description": "what caused this" }
  ],
  "affectedOrders": [list of affected order IDs as numbers],
  "recommendation": "actionable recommendation in 1-2 sentences",
  "severity": "low|medium|high|critical"
}

Categorize errors into groups like: network_timeout, http_4xx, http_5xx, circuit_breaker_open, chaos_injection, unknown.`,
      },
    ],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "{}";

  try {
    return JSON.parse(raw) as RootCauseAnalysis;
  } catch {
    return {
      summary: `${failures.length} integration failures detected`,
      rootCauses: [{ category: "unknown", count: failures.length, description: raw }],
      affectedOrders: failures.map((f) => f.order_id ?? 0).filter((id) => id > 0),
      recommendation: "Manual investigation required.",
      severity: "high",
    };
  }
}

async function createJiraIssue(
  analysis: RootCauseAnalysis,
  failureCount: number
): Promise<string | null> {
  if (!JIRA_BASE_URL || !JIRA_EMAIL || !JIRA_API_TOKEN) {
    console.log("Jira not configured — skipping issue creation");
    return null;
  }

  const priorityMap: Record<string, string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Highest",
  };

  const body = {
    fields: {
      project: { key: JIRA_PROJECT_KEY },
      summary: `[Integration Alert] ${analysis.summary}`,
      description: {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: `Automated analysis detected ${failureCount} integration failures in the last hour.`,
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Root Cause Analysis" }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: analysis.summary }],
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Error Breakdown" }],
          },
          {
            type: "codeBlock",
            attrs: { language: "text" },
            content: [
              {
                type: "text",
                text: `Category | Count | Description\n${"-".repeat(60)}\n${analysis.rootCauses.map((rc) => `${rc.category.padEnd(20)} | ${String(rc.count).padEnd(5)} | ${rc.description}`).join("\n")}`,
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Recommendation" }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: analysis.recommendation }],
          },
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Affected Orders" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text:
                  analysis.affectedOrders.length > 0
                    ? analysis.affectedOrders.join(", ")
                    : "None identified",
              },
            ],
          },
        ],
      },
      issuetype: { name: "Bug" },
      priority: { name: priorityMap[analysis.severity] ?? "High" },
      labels: ["integration", "automated", "servicenow"],
    },
  };

  const res = await fetch(`${JIRA_BASE_URL}/rest/api/3/issue`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString("base64")}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Jira issue creation failed: ${res.status} ${text}`);
    return null;
  }

  const data = (await res.json()) as { key: string; self: string };
  console.log(`Created Jira issue: ${data.key}`);
  return data.key;
}

export const integrationLogAnalyzer = schedules.task({
  id: "integration-log-analyzer",
  // Run every hour
  cron: "0 * * * *",
  run: async () => {
    const since = new Date(Date.now() - 60 * 60 * 1000); // last 1 hour

    const result = await pool.query<IntegrationLog>(
      `SELECT id, order_id, service, status, payload, error_message, created_at
       FROM integration_logs
       WHERE status = 'failed' AND created_at >= $1
       ORDER BY created_at DESC`,
      [since]
    );

    const failures = result.rows;

    if (failures.length === 0) {
      console.log("No integration failures in the last hour — nothing to analyze");
      return { analyzed: false, failureCount: 0 };
    }

    console.log(`Analyzing ${failures.length} integration failures with Claude...`);
    const analysis = await analyzeLogsWithClaude(failures);

    console.log(`Severity: ${analysis.severity} | Summary: ${analysis.summary}`);
    console.log(`Recommendation: ${analysis.recommendation}`);

    // Only create Jira issue for medium+ severity
    let jiraKey: string | null = null;
    if (analysis.severity !== "low") {
      jiraKey = await createJiraIssue(analysis, failures.length);
    }

    // Persist analysis result back to DB (optional audit trail)
    await pool.query(
      `INSERT INTO integration_logs (order_id, service, status, payload, error_message)
       VALUES (NULL, 'ai-analyzer', 'success', $1, NULL)`,
      [
        JSON.stringify({
          analyzedAt: new Date().toISOString(),
          failureCount: failures.length,
          severity: analysis.severity,
          summary: analysis.summary,
          jiraKey,
        }),
      ]
    );

    return {
      analyzed: true,
      failureCount: failures.length,
      severity: analysis.severity,
      summary: analysis.summary,
      jiraKey,
      rootCauses: analysis.rootCauses,
    };
  },
});
