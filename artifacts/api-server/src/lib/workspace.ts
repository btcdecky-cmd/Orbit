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

const workspaceRoot = path.resolve(
  process.env.ORBIT_WORKSPACE_ROOT ??
    path.join(process.cwd(), "artifacts/autonomous-coding-studio/workspace"),
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

function normalizeRelativePath(relativePath: string): string {
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

async function ensureWorkspace(): Promise<void> {
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

function isAllowedCommand(command: string): boolean {
  if (command.length > 240) return false;
  if (/[;&|`$<>]/.test(command)) return false;
  if (/\b(rm|sudo|curl|wget|chmod|chown|kill|git\s+(push|reset|clean))\b/i.test(command)) {
    return false;
  }
  return /^(pnpm|npm|npx|node|tsc|git)\s+[a-zA-Z0-9@%_+=:./-]+(?:\s+[a-zA-Z0-9@%_+=:./-]+)*$/.test(
    command.trim(),
  );
}

export async function runSafeCommand(command: string): Promise<string> {
  if (!isAllowedCommand(command)) {
    return `Skipped unsafe command: ${command}`;
  }
  try {
    const result = await execFileAsync("bash", ["-lc", command], {
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