import { Router, type IRouter } from "express";
import {
  GetAgentWorkspaceResponse,
  RunAgentTaskBody,
  RunAgentTaskResponse,
} from "@workspace/api-zod";
import {
  applyWorkspaceChanges,
  getWorkspaceSnapshot,
  runSafeCommand,
  type WorkspaceChange,
} from "../lib/workspace";

const router: IRouter = Router();

type AgentPlan = {
  message: string;
  changes: Array<{ path: string; summary: string; content: string }>;
  commands: string[];
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parsePlan(content: string): AgentPlan {
  const jsonCandidate = content.match(/\{[\s\S]*\}/)?.[0];
  if (!jsonCandidate) throw new Error("Groq returned no structured agent plan.");
  const parsed: unknown = JSON.parse(jsonCandidate);
  if (!isObject(parsed) || typeof parsed.message !== "string") {
    throw new Error("Groq returned an invalid agent plan.");
  }
  const rawChanges = Array.isArray(parsed.changes) ? parsed.changes : [];
  const changes = rawChanges.flatMap((change) => {
    if (!isObject(change)) return [];
    if (
      typeof change.path !== "string" ||
      typeof change.summary !== "string" ||
      typeof change.content !== "string"
    ) {
      return [];
    }
    return [
      {
        path: change.path,
        summary: change.summary,
        content: change.content,
      },
    ];
  });
  const commands = Array.isArray(parsed.commands)
    ? parsed.commands.filter((command): command is string => typeof command === "string").slice(0, 3)
    : [];
  return { message: parsed.message, changes, commands };
}

router.get("/agent/workspace", async (_req, res): Promise<void> => {
  const workspace = await getWorkspaceSnapshot();
  res.json(GetAgentWorkspaceResponse.parse(workspace));
});

router.post("/agent/run", async (req, res): Promise<void> => {
  const parsedBody = RunAgentTaskBody.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(400).json({ error: parsedBody.error.message });
    return;
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    res.status(503).json({
      error: "GROQ_API_KEY is not configured in Replit Secrets.",
    });
    return;
  }

  const workspace = await getWorkspaceSnapshot();
  const context = Object.entries(workspace.contents)
    .map(([filePath, content]) => `FILE: ${filePath}\n${content}`)
    .join("\n\n")
    .slice(0, 60_000);

  const systemPrompt = `You are Orbit, an autonomous coding agent working inside a persistent project workspace.
Inspect the supplied files, decide the smallest complete implementation for the user's request, and return ONLY valid JSON with this shape:
{"message":"short user-facing summary","changes":[{"path":"relative/path","summary":"what changed","content":"complete new file content"}],"commands":["pnpm run build"]}
Rules:
- Return complete file contents for every changed file, never patches or ellipses.
- Paths must be relative to the workspace and must not contain .., leading slashes, or hidden system paths.
- Prefer editing existing files over adding unnecessary files.
- Commands are optional and must be safe validation commands only: pnpm, npm, npx, node, tsc, or read-only git status/diff.
- Do not return markdown fences or any text outside the JSON object.

CURRENT WORKSPACE:
${context}`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL ?? "openai/gpt-oss-120b",
        temperature: 0.2,
        max_tokens: 4096,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: parsedBody.data.prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      req.log.error({ status: response.status, errorText }, "Groq request failed");
      res.status(502).json({ error: "Groq could not complete the coding task." });
      return;
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      res.status(502).json({ error: "Groq returned an empty coding response." });
      return;
    }

    const plan = parsePlan(content);
    const safeChanges: WorkspaceChange[] = plan.changes.map(({ path, content: fileContent }) => ({
      path,
      content: fileContent,
    }));
    await applyWorkspaceChanges(safeChanges);

    const commandOutput = (
      await Promise.all(plan.commands.map((command) => runSafeCommand(command)))
    ).join("\n\n");
    const result = {
      message: plan.message,
      changes: plan.changes.map(({ path, summary }) => ({ path, summary })),
      commands: plan.commands,
      output: commandOutput,
      workspace: await getWorkspaceSnapshot(),
    };
    res.json(RunAgentTaskResponse.parse(result));
  } catch (error) {
    req.log.error({ error }, "Agent task failed");
    res.status(502).json({
      error: error instanceof Error ? error.message : "The coding task failed.",
    });
  }
});

export default router;