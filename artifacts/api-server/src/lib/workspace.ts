import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type WorkspaceFile = {
  path: string;
  kind: "file" | "folder";
  language: string | null;
  size: number;
};

export type WorkspaceSnapshot = {
  projectName: string;
  branch: string;
  status: string;
  files: WorkspaceFile[];
  contents: Record<string, string>;
};

export type WorkspaceChange = {
  path: string;
  content: string;
};

const defaultWorkspaceRoot =
  path.basename(process.cwd()) === "api-server"
    ? path.resolve(process.cwd(), "../autonomous-coding-studio/workspace")
    : path.resolve(process.cwd(), "artifacts/autonomous-coding-studio/workspace");

export const workspaceRoot = path.resolve(
  process.env.ORBIT_WORKSPACE_ROOT ?? defaultWorkspaceRoot,
);

const initialFiles: Record<string, string> = {
  "src/App.tsx": `import { useState } from "react";
import { Dashboard } from "./components/Dashboard";

export default function App() {
  const [activeView, setActiveView] = useState("overview");

  return (
    <main className="min-h-screen bg-canvas">
      <Dashboard activeView={activeView} onViewChange={setActiveView} />
    </main>
  );
}`,
  "src/components/Dashboard.tsx": `import { ActivityChart } from "./ActivityChart";
import { Sidebar } from "./Sidebar";

export function Dashboard({ activeView, onViewChange }) {
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-[220px_1fr]">
      <Sidebar activeView={activeView} onViewChange={onViewChange} />
      <section className="p-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Good morning, builder
        </h1>
        <ActivityChart />
      </section>
    </div>
  );
}`,
  "src/components/ActivityChart.tsx": `const points = [38, 52, 44, 61, 56, 72, 68];

export function ActivityChart() {
  return (
    <div className="mt-8 rounded-2xl border border-line bg-panel p-5">
      <p className="text-sm text-muted">Weekly activity</p>
      <div className="mt-6 flex h-32 items-end gap-3">
        {points.map((height, index) => (
          <div
            key={index}
            style={{ height: height + "%" }}
            className="flex-1 rounded-t-md bg-signal"
          />
        ))}
      </div>
    </div>
  );
}`,
  "src/components/Sidebar.tsx": `export function Sidebar({ activeView, onViewChange }) {
  const items = ["overview", "projects", "settings"];

  return (
    <aside className="min-h-screen border-r border-line p-5">
      <span className="text-lg font-semibold">orbit</span>
      <nav className="mt-12 space-y-1">
        {items.map((item) => (
          <button
            key={item}
            onClick={() => onViewChange(item)}
            className={activeView === item ? "bg-signal-muted" : ""}
          >
            {item}
          </button>
        ))}
      </nav>
    </aside>
  );
}`,
  "package.json": `{
  "name": "orbit-workspace",
  "private": true,
  "scripts": {
    "build": "echo \\"Connect this workspace to your app build command\\""
  }
}`,
  "README.md": `# Orbit workspace

This project is managed by Orbit, an autonomous coding agent.

Describe a change in the studio and Orbit will inspect this workspace, edit files, run safe validation commands, and report the result.
`,
  "index.html": `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Orbit workspace preview</title>
    <link rel="stylesheet" href="/api/agent/preview/src/styles.css" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/api/agent/preview/src/app.js"></script>
  </body>
</html>
`,
  "src/app.js": `const root = document.querySelector("#app");

root.innerHTML = \`
  <main class="preview-shell">
    <nav class="preview-nav">
      <strong>orbit</strong>
      <span class="preview-pill">workspace preview</span>
    </nav>
    <section class="preview-hero">
      <p class="eyebrow">Persistent project</p>
      <h1>Build something worth shipping.</h1>
      <p class="lede">This page is served directly from the workspace files Orbit edits.</p>
      <div class="preview-actions">
        <button id="primary-action">Explore workspace</button>
        <span id="action-status">Ready for your next change.</span>
      </div>
    </section>
    <section class="preview-grid">
      <article><span class="metric">01</span><h2>Inspect</h2><p>Every file stays visible in the Orbit editor.</p></article>
      <article><span class="metric">02</span><h2>Change</h2><p>Ask the agent for a focused implementation.</p></article>
      <article><span class="metric">03</span><h2>Verify</h2><p>Run safe checks and inspect the rendered result.</p></article>
    </section>
  </main>
\`;

document.querySelector("#primary-action").addEventListener("click", () => {
  document.querySelector("#action-status").textContent = "The workspace is live and editable.";
});
`,
  "src/styles.css": `:root {
  color: #182033;
  background: #f4f6f8;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
}

* { box-sizing: border-box; }
body { margin: 0; }
.preview-shell { max-width: 980px; margin: 0 auto; padding: 32px clamp(20px, 6vw, 72px) 72px; }
.preview-nav { display: flex; align-items: center; justify-content: space-between; padding: 8px 0 56px; }
.preview-nav strong { font-size: 20px; letter-spacing: -0.06em; }
.preview-pill { border: 1px solid #dce3e8; border-radius: 999px; color: #667085; font-size: 11px; padding: 8px 12px; }
.preview-hero { border-radius: 28px; background: #182033; color: white; padding: clamp(28px, 7vw, 76px); }
.eyebrow, .metric { color: #4ad4ad; font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
h1 { max-width: 620px; margin: 18px 0; font-size: clamp(42px, 7vw, 84px); letter-spacing: -.075em; line-height: .94; }
.lede { max-width: 520px; color: #b9c1d0; font-size: 18px; line-height: 1.6; }
.preview-actions { align-items: center; display: flex; flex-wrap: wrap; gap: 16px; margin-top: 36px; }
button { border: 0; border-radius: 10px; background: #36c69d; color: #10221f; cursor: pointer; font-weight: 700; padding: 13px 17px; }
#action-status { color: #8f9bad; font-size: 12px; }
.preview-grid { display: grid; gap: 16px; grid-template-columns: repeat(3, 1fr); margin-top: 18px; }
.preview-grid article { border: 1px solid #dce3e8; border-radius: 18px; background: white; padding: 22px; }
.preview-grid h2 { margin: 30px 0 8px; font-size: 19px; letter-spacing: -.04em; }
.preview-grid p { color: #667085; font-size: 13px; line-height: 1.6; margin: 0; }
@media (max-width: 680px) { .preview-grid { grid-template-columns: 1fr; } .preview-nav { padding-bottom: 32px; } }
`,
};

function languageFor(filePath: string): string | null {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".tsx" || extension === ".ts") return "typescript";
  if (extension === ".jsx" || extension === ".js") return "javascript";
  if (extension === ".json") return "json";
  if (extension === ".css") return "css";
  if (extension === ".md") return "markdown";
  return null;
}

export function normalizeRelativePath(relativePath: string): string {
  const normalized = path.posix.normalize(relativePath.replaceAll("\\", "/"));
  if (
    !relativePath ||
    normalized === "." ||
    normalized.startsWith("../") ||
    normalized.includes("/../") ||
    path.posix.isAbsolute(normalized)
  ) {
    throw new Error("Workspace paths must stay inside the project workspace.");
  }
  return normalized;
}

function absolutePath(relativePath: string): string {
  return path.join(workspaceRoot, normalizeRelativePath(relativePath));
}

export async function ensureWorkspace(): Promise<void> {
  await fs.mkdir(workspaceRoot, { recursive: true });
  for (const [relativePath, content] of Object.entries(initialFiles)) {
    const target = absolutePath(relativePath);
    try {
      await fs.access(target);
    } catch {
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, content, "utf8");
    }
  }
}

async function walk(directory: string, prefix = ""): Promise<WorkspaceFile[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const result: WorkspaceFile[] = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if ([".git", "node_modules", "dist"].includes(entry.name)) continue;
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      result.push({
        path: relativePath,
        kind: "folder",
        language: null,
        size: 0,
      });
      result.push(...(await walk(target, relativePath)));
    } else if (entry.isFile()) {
      const stat = await fs.stat(target);
      result.push({
        path: relativePath,
        kind: "file",
        language: languageFor(relativePath),
        size: stat.size,
      });
    }
  }
  return result;
}

export async function getWorkspaceSnapshot(): Promise<WorkspaceSnapshot> {
  await ensureWorkspace();
  const files = await walk(workspaceRoot);
  const contents: Record<string, string> = {};
  for (const file of files.filter((item) => item.kind === "file")) {
    if (file.size > 250_000) continue;
    contents[file.path] = await fs.readFile(absolutePath(file.path), "utf8");
  }
  return {
    projectName: "orbit-workspace",
    branch: "main",
    status: "ready",
    files,
    contents,
  };
}

export async function applyWorkspaceChanges(
  changes: WorkspaceChange[],
): Promise<void> {
  await ensureWorkspace();
  for (const change of changes) {
    const target = absolutePath(change.path);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, change.content, "utf8");
  }
}

export async function updateWorkspaceFile(
  relativePath: string,
  content: string,
): Promise<void> {
  await applyWorkspaceChanges([{ path: relativePath, content }]);
}

function isAllowedCommand(command: string): boolean {
  if (command.length > 240) return false;
  if (/[;&|`$<>]/.test(command)) return false;
  const trimmed = command.trim();
  return /^tsc(?:\s+--(?:noEmit|pretty=false))?$/.test(trimmed)
    || /^git\s+(?:status|diff(?:\s+--stat)?)$/.test(trimmed);
}

export async function runSafeCommand(command: string): Promise<string> {
  if (!isAllowedCommand(command)) {
    return `Skipped unsafe command: ${command}`;
  }
  try {
    const [executable, ...args] = command.trim().split(/\s+/);
    const result = await execFileAsync(executable, args, {
      cwd: workspaceRoot,
      timeout: 45_000,
      maxBuffer: 200_000,
    });
    return `$ ${command}\n${result.stdout}${result.stderr}`.trim();
  } catch (error) {
    const details = error as { stdout?: string; stderr?: string; message?: string };
    return `$ ${command}\n${details.stdout ?? ""}${details.stderr ?? details.message ?? "Command failed"}`.trim();
  }
}