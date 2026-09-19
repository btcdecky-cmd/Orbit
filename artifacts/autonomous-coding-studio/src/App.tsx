import { type FormEvent, type ReactNode, useMemo, useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from '@tanstack/react-query';
import {
  getGetAgentWorkspaceQueryKey,
  useGetAgentWorkspace,
  useRunAgentTask,
} from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  ArrowUpRight,
  Bot,
  Braces,
  Check,
  ChevronDown,
  CircleDot,
  Code2,
  Command,
  ExternalLink,
  Eye,
  EyeOff,
  FileCode2,
  FileJson,
  Folder,
  GitBranch,
  Layers3,
  Loader2,
  Menu,
  Monitor,
  MoreHorizontal,
  PanelLeft,
  Plus,
  Send,
  Settings2,
  Sparkles,
  SquareTerminal,
  TriangleAlert,
  X,
  Zap,
} from 'lucide-react';
import {
  Link,
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

type WorkspaceFile = {
  path: string;
  kind: 'file' | 'folder';
  language: string | null;
  size: number;
};

type WorkspaceSnapshot = {
  projectName: string;
  branch: string;
  status: string;
  files: WorkspaceFile[];
  contents: Record<string, string>;
};

function LogoMark({ dark = false }: { dark?: boolean }) {
  return (
    <span className={`relative flex h-8 w-8 items-center justify-center rounded-[10px] ${dark ? 'bg-[hsl(166_78%_45%)]' : 'bg-[hsl(228_31%_14%)]'}`}>
      <span className={`h-3 w-3 rounded-full border-2 ${dark ? 'border-[hsl(228_31%_14%)]' : 'border-[hsl(166_78%_45%)]'}`} />
      <span className={`absolute h-1.5 w-1.5 rounded-full ${dark ? 'bg-[hsl(228_31%_14%)]' : 'bg-[hsl(166_78%_45%)]'}`} />
    </span>
  );
}

function Home() {
  const [, setLocation] = useLocation();
  const [idea, setIdea] = useState('');

  const beginBuild = (event?: FormEvent) => {
    event?.preventDefault();
    const query = idea.trim() ? `?prompt=${encodeURIComponent(idea.trim())}` : '';
    setLocation(`/studio${query}`);
  };

  return (
    <div className="orbit-noise min-h-[100dvh] overflow-hidden bg-[hsl(222_34%_97%)] text-[hsl(225_28%_16%)]">
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-3" data-testid="link-home-logo">
          <LogoMark />
          <span className="font-[family-name:var(--app-font-serif)] text-xl font-bold tracking-[-0.04em]">orbit</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-[hsl(220_12%_48%)] md:flex">
          <a href="#loop" className="transition-colors hover:text-[hsl(225_28%_16%)]">How it works</a>
          <a href="#principles" className="transition-colors hover:text-[hsl(225_28%_16%)]">Principles</a>
          <Link href="/studio" className="flex items-center gap-2 font-semibold text-[hsl(225_28%_16%)]" data-testid="link-nav-studio">
            Open studio <ArrowUpRight className="h-4 w-4" />
          </Link>
        </nav>
        <Link href="/studio" className="rounded-full border border-[hsl(220_21%_88%)] bg-white/70 px-4 py-2 text-xs font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:border-[hsl(166_78%_36%)] md:hidden" data-testid="link-mobile-studio">
          Open studio
        </Link>
      </header>

      <main>
        <section className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-12 sm:px-8 sm:pt-20 lg:grid-cols-[1.02fr_.98fr] lg:gap-20 lg:px-12 lg:pb-36 lg:pt-28">
          <div className="orbit-grid pointer-events-none absolute inset-x-0 top-0 h-[720px] opacity-70" />
          <div className="relative z-10">
            <div className="orbit-enter inline-flex items-center gap-2 rounded-full border border-[hsl(166_78%_36%_/_0.2)] bg-[hsl(166_78%_36%_/_0.06)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[hsl(166_78%_36%)]">
              <span className="orbit-pulse h-1.5 w-1.5 rounded-full bg-[hsl(166_78%_36%)]" />
              Your new pair, already in motion
            </div>
            <h1 className="orbit-enter orbit-enter-delay-1 mt-7 max-w-3xl font-[family-name:var(--app-font-serif)] text-[clamp(3.6rem,9vw,7.5rem)] font-extrabold leading-[.9] tracking-[-0.075em]">
              Make the leap<br /><span className="text-[hsl(166_78%_36%)]">from idea to live.</span>
            </h1>
            <p className="orbit-enter orbit-enter-delay-2 mt-8 max-w-xl text-lg leading-8 text-[hsl(220_12%_48%)] sm:text-xl">
              Orbit is an autonomous coding partner that turns a clear sentence into a working product — planning, editing, testing, and showing its work along the way.
            </p>
            <form onSubmit={beginBuild} className="orbit-enter orbit-enter-delay-3 mt-10 max-w-xl rounded-2xl border border-[hsl(220_21%_88%)] bg-white p-2 shadow-[0_20px_60px_hsl(225_28%_16%_/_0.08)]">
              <div className="flex items-end gap-3">
                <textarea
                  value={idea}
                  onChange={(event) => setIdea(event.target.value)}
                  rows={2}
                  placeholder="Describe something you want to build..."
                  className="min-h-[62px] flex-1 resize-none bg-transparent px-3 py-2 text-sm leading-6 outline-none placeholder:text-[hsl(220_12%_63%)]"
                  data-testid="input-home-idea"
                />
                <button type="submit" className="group flex h-11 shrink-0 items-center gap-2 rounded-xl bg-[hsl(228_31%_14%)] px-4 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[hsl(166_78%_36%)]" data-testid="button-start-build">
                  Start building <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </div>
              <div className="mt-1 flex items-center gap-2 border-t border-[hsl(220_21%_92%)] px-3 pt-2 text-[11px] text-[hsl(220_12%_55%)]">
                <Sparkles className="h-3.5 w-3.5 text-[hsl(35_97%_61%)]" /> No setup. No ceremony. Just a place to start.
              </div>
            </form>
          </div>

          <div className="relative z-10 lg:pt-10">
            <div className="relative mx-auto max-w-[520px] rotate-[1.5deg] rounded-[24px] border border-[hsl(225_23%_26%)] bg-[hsl(228_31%_14%)] p-2 shadow-[0_35px_80px_hsl(228_31%_14%_/_0.28)] transition-transform duration-500 hover:rotate-0">
              <div className="rounded-[18px] border border-white/10 bg-[hsl(226_29%_18%)] p-4 sm:p-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5"><LogoMark dark /><div><p className="text-xs font-semibold text-white">orbit / northstar</p><p className="font-mono text-[10px] text-white/40">building preview</p></div></div>
                  <div className="flex items-center gap-1.5 rounded-full bg-[hsl(166_78%_45%_/_0.12)] px-2 py-1 text-[10px] font-medium text-[hsl(166_78%_60%)]"><span className="orbit-pulse h-1.5 w-1.5 rounded-full bg-[hsl(166_78%_45%)]" /> live</div>
                </div>
                <div className="grid gap-4 py-5 sm:grid-cols-[.75fr_1.25fr]">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 rounded-lg bg-white/[.06] px-3 py-2 text-[10px] text-white/70"><ChevronDown className="h-3 w-3" /> src</div>
                    <div className="space-y-1 pl-3 font-mono text-[10px] text-white/45"><div className="text-[hsl(166_78%_60%)]">App.tsx</div><div>Dashboard.tsx</div><div>ActivityChart.tsx</div><div>Sidebar.tsx</div><div>package.json</div></div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[hsl(228_31%_12%)] p-3">
                    <div className="mb-4 flex items-center gap-2"><div className="h-7 w-7 rounded-full bg-[hsl(35_97%_61%)]/20 p-1.5"><Bot className="h-full w-full text-[hsl(35_97%_61%)]" /></div><span className="text-[10px] text-white/80">Orbit agent</span><span className="ml-auto font-mono text-[9px] text-white/35">03:42</span></div>
                    <p className="text-[11px] leading-5 text-white/65">I found the dashboard entry point. I’m shaping the activity card first, then I’ll wire the navigation state.</p>
                    <div className="mt-4 space-y-2 font-mono text-[9px]"><div className="flex items-center gap-2 text-[hsl(166_78%_60%)]"><Check className="h-3 w-3" /> Read 5 files</div><div className="flex items-center gap-2 text-white/45"><span className="h-3 w-3 rounded-full border border-[hsl(35_97%_61%)]" /> Updating Dashboard.tsx</div></div>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-4 font-mono text-[9px] text-white/35"><span>✓ 0 problems</span><span>preview: localhost:5173</span></div>
              </div>
              <div className="absolute -bottom-6 -left-8 hidden rounded-xl border border-[hsl(35_97%_61%_/_0.35)] bg-[hsl(35_97%_61%)] px-3 py-2 text-[10px] font-bold text-[hsl(225_28%_16%)] shadow-lg sm:block"><Zap className="mr-1 inline h-3 w-3" /> intent → implementation</div>
            </div>
          </div>
        </section>

        <section id="loop" className="border-y border-[hsl(220_21%_88%)] bg-white/60 px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:gap-24">
              <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[hsl(166_78%_36%)]">The agent loop</p><h2 className="mt-4 max-w-md font-[family-name:var(--app-font-serif)] text-4xl font-bold tracking-[-.05em] sm:text-5xl">You stay in the loop. Orbit does the loops.</h2></div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[['01', 'Describe', 'Start with the outcome, not a ticket. Orbit turns your intent into a concrete build plan.'], ['02', 'Build', 'The agent edits real files, runs commands, and keeps changes legible as it moves.'], ['03', 'Verify', 'Every meaningful step comes with visible output, checks, and a preview you can touch.'], ['04', 'Steer', 'Change direction in plain language. You own the decisions; Orbit owns the busywork.']].map(([number, title, copy]) => (
                  <div key={number} className="group rounded-2xl border border-[hsl(220_21%_88%)] bg-[hsl(222_34%_97%)] p-5 transition-all hover:-translate-y-1 hover:border-[hsl(166_78%_36%_/_0.35)]">
                    <div className="flex items-center justify-between"><span className="font-mono text-xs text-[hsl(220_12%_55%)]">{number}</span><ArrowUpRight className="h-4 w-4 text-[hsl(220_12%_63%)] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></div>
                    <h3 className="mt-8 font-[family-name:var(--app-font-serif)] text-xl font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-[hsl(220_12%_48%)]">{copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="principles" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="rounded-[28px] bg-[hsl(228_31%_14%)] p-7 text-white sm:p-12 lg:p-16">
            <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
              <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[hsl(166_78%_60%)]">A sharper default</p><h2 className="mt-4 font-[family-name:var(--app-font-serif)] text-4xl font-bold tracking-[-.05em] sm:text-5xl">A capable partner, never a black box.</h2></div>
              <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
                {['Changes you can inspect', 'Commands you can replay', 'A preview you can trust', 'An agent you can interrupt'].map((item, index) => <div key={item} className="border-t border-white/15 pt-4"><span className="font-mono text-xs text-[hsl(35_97%_61%)]">0{index + 1}</span><p className="mt-3 text-sm font-medium text-white/80">{item}</p></div>)}
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="mx-auto flex max-w-7xl items-center justify-between px-5 pb-8 text-xs text-[hsl(220_12%_55%)] sm:px-8 lg:px-12"><span>Orbit · a calm place to ship</span><span className="font-mono">build with intent</span></footer>
      </div>
  );
}

function fileIcon(kind: string) {
  if (kind === 'folder') return <Folder className="h-4 w-4 text-[hsl(35_97%_61%)]" />;
  if (kind === 'json') return <FileJson className="h-4 w-4 text-[hsl(35_97%_61%)]" />;
  return <FileCode2 className="h-4 w-4 text-[hsl(221_74%_63%)]" />;
}

function StudioHeader({ projectName, branch, onToggleFiles, previewVisible, onTogglePreview }: { projectName: string; branch: string; onToggleFiles: () => void; previewVisible: boolean; onTogglePreview: () => void }) {
  const [, setLocation] = useLocation();
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-[hsl(225_23%_26%)] bg-[hsl(228_31%_14%)] px-4 text-white sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white lg:hidden" onClick={onToggleFiles} data-testid="button-toggle-files"><Menu className="h-5 w-5" /></button>
        <Link href="/" className="hidden items-center gap-2.5 sm:flex" data-testid="link-studio-logo"><LogoMark dark /><span className="font-[family-name:var(--app-font-serif)] text-lg font-bold tracking-[-.04em]">orbit</span></Link>
        <div className="hidden h-5 w-px bg-white/15 sm:block" />
        <div className="min-w-0"><div className="flex items-center gap-2"><span className="truncate text-sm font-semibold">{projectName}</span><span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[9px] text-white/50">{branch}</span></div><div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-white/40"><span className="h-1.5 w-1.5 rounded-full bg-[hsl(166_78%_45%)]" /> Workspace synced</div></div>
      </div>
      <div className="flex items-center gap-1.5">
        <button onClick={onTogglePreview} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${previewVisible ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/10 hover:text-white'}`} data-testid="button-toggle-preview">{previewVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />} <span className="hidden sm:inline">Preview</span></button>
        <button className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white" data-testid="button-studio-settings"><Settings2 className="h-4 w-4" /></button>
        <button onClick={() => setLocation('/')} className="hidden rounded-lg border border-white/15 px-3 py-2 text-xs font-medium text-white/65 transition-colors hover:border-white/30 hover:text-white sm:block" data-testid="button-exit-studio">Exit studio</button>
      </div>
    </header>
  );
}

function FileExplorer({ files, selectedFile, onSelect, open, onClose }: { files: WorkspaceFile[]; selectedFile: string; onSelect: (path: string) => void; open: boolean; onClose: () => void }) {
  return (
    <aside className={`${open ? 'fixed inset-x-3 top-[72px] z-30 block shadow-2xl' : 'hidden'} max-h-[calc(100dvh-88px)] overflow-auto rounded-xl border border-[hsl(225_23%_26%)] bg-[hsl(226_29%_18%)] lg:relative lg:inset-auto lg:top-auto lg:z-auto lg:block lg:max-h-none lg:rounded-none lg:border-0 lg:border-r lg:shadow-none w-auto shrink-0 text-white/70 lg:w-60`} data-testid="file-explorer">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-4"><div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.16em] text-white/45"><PanelLeft className="h-3.5 w-3.5" /> Explorer</div><button className="rounded p-1 text-white/45 hover:bg-white/10 hover:text-white lg:hidden" onClick={onClose} data-testid="button-close-files"><X className="h-4 w-4" /></button></div>
       <div className="flex items-center justify-between px-4 py-4"><div className="font-mono text-[11px] text-white/40">ORBIT-WORKSPACE</div><button className="text-white/35 hover:text-white" data-testid="button-file-options"><MoreHorizontal className="h-4 w-4" /></button></div>
      <div className="space-y-0.5 px-2 pb-5">
         {files.map((file) => {
           const label = file.path.split('/').pop() ?? file.path;
           const nested = file.path.includes('/');
           return <button key={file.path} onClick={() => { if (file.kind !== 'folder') onSelect(file.path); }} className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs transition-colors ${nested ? 'pl-7' : ''} ${selectedFile === file.path ? 'bg-[hsl(166_78%_45%_/_0.13)] text-[hsl(166_78%_60%)]' : 'text-white/55 hover:bg-white/[.06] hover:text-white/85'}`} data-testid={`button-file-${label.replace('.', '-')}`}>{file.kind === 'folder' ? <ChevronDown className="h-3.5 w-3.5 text-white/35" /> : <span className="w-3.5" />}{fileIcon(file.kind)}<span className="truncate">{label}</span>{selectedFile === file.path && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[hsl(166_78%_45%)]" />}</button>;
         })}
      </div>
      <div className="border-t border-white/10 px-4 py-4"><button className="flex w-full items-center gap-2 text-xs text-white/45 transition-colors hover:text-white" data-testid="button-add-file"><Plus className="h-4 w-4" /> New file</button></div>
    </aside>
  );
}

function CodeEditor({ selectedFile, content, loading }: { selectedFile: string; content: string; loading?: boolean }) {
  const lines = useMemo(() => content.split('\n'), [content]);
  return (
    <div className="flex min-h-[390px] flex-1 flex-col overflow-hidden bg-[hsl(228_31%_14%)] text-[12px] sm:min-h-[480px]" data-testid="code-editor">
       <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5"><div className="flex items-center gap-2 text-xs text-white/60">{fileIcon(selectedFile.endsWith('.json') ? 'json' : 'tsx')}<span>{selectedFile ? selectedFile.split('/').pop() : 'Loading workspace'}</span><span className="text-white/25">·</span><span className="font-mono text-[10px] text-white/35">{loading ? 'loading workspace' : 'synced from workspace'}</span></div><div className="flex items-center gap-1 text-[10px] text-white/35"><Braces className="h-3.5 w-3.5" /> {selectedFile.endsWith('.json') ? 'JSON' : 'TypeScript'}</div></div>
      <div className="scrollbar-thin code-surface flex-1 overflow-auto px-3 py-4 sm:px-0">
        {lines.map((line, index) => <div className="code-line flex" key={`${selectedFile}-${index}`}><span className="w-9 shrink-0 select-none pr-3 text-right text-[10px] leading-[1.45rem] text-white/20 sm:w-14 sm:pr-5">{index + 1}</span><code className={`leading-[1.45rem] ${line.includes('export') || line.includes('import') ? 'text-[hsl(221_74%_72%)]' : line.includes('className') ? 'text-[hsl(35_97%_72%)]' : line.includes('//') ? 'text-white/30' : 'text-white/70'}`}>{line || ' '}</code></div>)}
      </div>
    </div>
  );
}

function ActivityPanel({ running, fileCount }: { running: boolean; fileCount: number }) {
  return (
    <div className="border-t border-white/10 bg-[hsl(228_31%_14%)] p-4 sm:p-5" data-testid="activity-panel">
       <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-white/40"><CircleDot className="h-3.5 w-3.5 text-[hsl(166_78%_45%)]" /> Agent activity</div><span className="font-mono text-[10px] text-white/30">{running ? 'working now' : `${fileCount} files indexed`}</span></div>
      <div className="mt-4 space-y-3">
         {[['Read project structure', `${fileCount} files`, true], ['Waiting for your next instruction', running ? 'paused' : 'ready', !running], ['Applying the current request', running ? 'working' : 'idle', !running]].map(([title, meta, done]) => <div key={`${title}`} className="flex items-center gap-3 text-xs"><span className={`flex h-5 w-5 items-center justify-center rounded-full ${done ? 'bg-[hsl(166_78%_45%_/_0.14)] text-[hsl(166_78%_60%)]' : 'border border-[hsl(35_97%_61%_/_0.5)] text-[hsl(35_97%_61%)]'}`}>{done ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-[hsl(35_97%_61%)]" />}</span><span className={done ? 'text-white/55' : 'text-white/85'}>{title}</span><span className="ml-auto font-mono text-[10px] text-white/30">{meta}</span></div>)}
      </div>
    </div>
  );
}

type AgentMessage = { role: 'agent' | 'user'; text: string; meta: string };

function AgentPanel({ initialPrompt, onWorkspaceUpdate }: { initialPrompt: string; onWorkspaceUpdate: (workspace: WorkspaceSnapshot) => void }) {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [draft, setDraft] = useState(initialPrompt);
  const mutation = useRunAgentTask({
    mutation: {
      onSuccess: (result) => {
        setMessages((current) => [...current, { role: 'agent', text: result.message, meta: 'Orbit · just now' }, ...(result.output ? [{ role: 'agent' as const, text: result.output, meta: 'Command output · just now' }] : [])]);
        onWorkspaceUpdate(result.workspace);
        queryClient.setQueryData(getGetAgentWorkspaceQueryKey(), result.workspace);
      },
      onError: (error) => {
        setMessages((current) => [...current, { role: 'agent', text: error instanceof Error ? error.message : 'The agent request failed.', meta: 'Orbit · error' }]);
      },
    },
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;
    const prompt = draft.trim();
    setMessages((current) => [...current, { role: 'user', text: prompt, meta: 'You · just now' }]);
    setDraft('');
    mutation.mutate({ data: { prompt } });
  };
  return (
    <section className="flex min-h-[430px] flex-col border-t border-white/10 bg-[hsl(226_29%_18%)] lg:min-h-0 lg:w-[360px] lg:border-l lg:border-t-0" data-testid="agent-panel">
       <div className="flex items-center justify-between border-b border-white/10 px-4 py-4"><div className="flex items-center gap-2.5"><div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[hsl(35_97%_61%_/_0.14)] text-[hsl(35_97%_61%)]">{mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}</div><div><p className="text-xs font-semibold text-white">Orbit agent</p><p className="text-[10px] text-white/35">{mutation.isPending ? 'editing your workspace' : 'connected to your workspace'}</p></div></div><button className="rounded p-1 text-white/40 hover:bg-white/10 hover:text-white" data-testid="button-agent-menu"><MoreHorizontal className="h-4 w-4" /></button></div>
      <div className="scrollbar-thin flex-1 space-y-5 overflow-auto p-4">
        {messages.map((message, index) => <div key={`${message.role}-${index}`} className={message.role === 'user' ? 'ml-8' : ''}><div className="mb-1 flex items-center gap-2 text-[10px] text-white/35"><span>{message.meta}</span>{message.role === 'agent' && <span className="h-1 w-1 rounded-full bg-[hsl(166_78%_45%)]" />}</div><div className={`rounded-xl px-3 py-3 text-xs leading-5 ${message.role === 'user' ? 'bg-[hsl(166_78%_45%)] text-[hsl(228_31%_14%)]' : 'border border-white/10 bg-[hsl(228_31%_14%)] text-white/65'}`}>{message.text}</div></div>)}
         <div className="rounded-xl border border-[hsl(35_97%_61%_/_0.25)] bg-[hsl(35_97%_61%_/_0.06)] p-3"><div className="flex items-center gap-2 text-[10px] font-semibold text-[hsl(35_97%_72%)]"><Sparkles className="h-3.5 w-3.5" /> Current focus</div><p className="mt-2 text-[11px] leading-5 text-white/55">{mutation.isPending ? 'Reading the workspace and preparing a real change.' : 'Describe the next change you want made to the project.'}</p><div className="mt-3 flex items-center gap-2 font-mono text-[9px] text-white/35"><FileCode2 className="h-3 w-3" /> persistent workspace</div></div>
      </div>
       <form onSubmit={submit} className="border-t border-white/10 p-3"><div className="rounded-xl border border-white/15 bg-[hsl(228_31%_14%)] p-2 transition-colors focus-within:border-[hsl(166_78%_45%_/_0.6)]"><textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={2} placeholder="Tell Orbit what to change..." className="w-full resize-none bg-transparent px-1 text-xs leading-5 text-white outline-none placeholder:text-white/30" disabled={mutation.isPending} data-testid="input-agent-request" /><div className="mt-2 flex items-center justify-between"><div className="flex items-center gap-1 text-[10px] text-white/25"><Command className="h-3 w-3" /> Enter to send</div><button type="submit" disabled={mutation.isPending} className="flex h-7 w-7 items-center justify-center rounded-lg bg-[hsl(166_78%_45%)] text-[hsl(228_31%_14%)] transition-transform hover:scale-105 disabled:cursor-wait disabled:opacity-50" data-testid="button-send-request">{mutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}</button></div></div></form>
    </section>
  );
}

function PreviewPane({ workspace }: { workspace?: WorkspaceSnapshot }) {
  const fileCount = workspace?.files.filter((file) => file.kind === 'file').length ?? 0;
  const readme = workspace?.contents['README.md'] ?? 'The workspace is loading.';
  return (
    <div className="border-t border-[hsl(220_21%_88%)] bg-[hsl(222_34%_97%)] p-3 sm:p-5" data-testid="preview-pane">
      <div className="overflow-hidden rounded-xl border border-[hsl(220_21%_88%)] bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-[hsl(220_21%_92%)] bg-[hsl(222_34%_97%)] px-3 py-2">
          <div className="flex gap-1"><span className="h-2 w-2 rounded-full bg-[hsl(3_73%_52%_/_0.6)]" /><span className="h-2 w-2 rounded-full bg-[hsl(35_97%_61%_/_0.7)]" /><span className="h-2 w-2 rounded-full bg-[hsl(166_78%_36%_/_0.6)]" /></div>
          <div className="mx-auto flex items-center gap-2 rounded bg-white px-3 py-1 font-mono text-[9px] text-[hsl(220_12%_55%)] shadow-sm"><span>workspace://orbit</span><ExternalLink className="h-3 w-3" /></div>
          <MoreHorizontal className="h-4 w-4 text-[hsl(220_12%_55%)]" />
        </div>
        <div className="min-h-[180px] p-5 sm:min-h-[210px] sm:p-7">
          <div className="flex items-start justify-between gap-5"><div><p className="text-[9px] font-semibold uppercase tracking-[.16em] text-[hsl(220_12%_55%)]">Persistent project</p><h3 className="mt-2 font-[family-name:var(--app-font-serif)] text-xl font-bold tracking-[-.04em] text-[hsl(225_28%_16%)] sm:text-2xl">{workspace?.projectName ?? 'Connecting to workspace'}</h3></div><div className="rounded-lg bg-[hsl(166_78%_36%)] px-3 py-2 text-[10px] font-semibold text-white">{fileCount} files</div></div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-lg border border-[hsl(220_21%_88%)] p-3"><p className="text-[9px] text-[hsl(220_12%_55%)]">Branch</p><p className="mt-2 text-sm font-bold text-[hsl(225_28%_16%)]">{workspace?.branch ?? '—'}</p></div><div className="rounded-lg border border-[hsl(220_21%_88%)] p-3"><p className="text-[9px] text-[hsl(220_12%_55%)]">Status</p><p className="mt-2 text-sm font-bold text-[hsl(166_78%_36%)]">{workspace?.status ?? 'connecting'}</p></div></div>
          <pre className="mt-4 max-h-16 overflow-auto whitespace-pre-wrap rounded-lg bg-[hsl(228_31%_14%)] p-3 font-mono text-[10px] leading-5 text-white/60">{readme}</pre>
        </div>
      </div>
    </div>
  );
}

function Studio() {
  const workspaceQuery = useGetAgentWorkspace();
  const [liveWorkspace, setLiveWorkspace] = useState<WorkspaceSnapshot>();
  const [selectedFile, setSelectedFile] = useState('src/App.tsx');
  const [activeTab, setActiveTab] = useState<'editor' | 'activity' | 'terminal' | 'problems'>('editor');
  const [filesOpen, setFilesOpen] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(true);
  const workspace = liveWorkspace ?? workspaceQuery.data;
  const contents = workspace?.contents ?? {};
  const activeFile = contents[selectedFile] ? selectedFile : Object.keys(contents)[0] ?? '';
  const prompt = new URLSearchParams(window.location.search).get('prompt') ?? '';
  const tabs = [{ id: 'editor', label: 'Editor', icon: Code2 }, { id: 'activity', label: 'Activity', icon: Layers3 }, { id: 'terminal', label: 'Terminal', icon: SquareTerminal }, { id: 'problems', label: 'Problems', icon: TriangleAlert }];
  return (
    <div className="orbit-noise flex min-h-[100dvh] flex-col bg-[hsl(228_31%_14%)] text-white">
      <StudioHeader projectName={workspace?.projectName ?? 'orbit-workspace'} branch={workspace?.branch ?? 'main'} onToggleFiles={() => setFilesOpen((value) => !value)} previewVisible={previewVisible} onTogglePreview={() => setPreviewVisible((value) => !value)} />
      {workspaceQuery.error && <div className="border-b border-[hsl(3_73%_52%_/_0.35)] bg-[hsl(3_73%_52%_/_0.1)] px-4 py-2 text-xs text-[hsl(3_73%_72%)]">Workspace API unavailable: {workspaceQuery.error instanceof Error ? workspaceQuery.error.message : 'Could not load the project workspace.'}</div>}
      <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
        <FileExplorer files={workspace?.files ?? []} selectedFile={activeFile} onSelect={(path) => { setSelectedFile(path); setFilesOpen(false); }} open={filesOpen} onClose={() => setFilesOpen(false)} />
        <main className="flex min-w-0 flex-1 flex-col">
          <div className="scrollbar-thin flex shrink-0 items-center gap-1 overflow-x-auto border-b border-white/10 bg-[hsl(226_29%_18%)] px-3 py-2 lg:hidden">
            {tabs.map((tab) => { const Icon = tab.icon; return <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-medium ${activeTab === tab.id ? 'bg-white/10 text-white' : 'text-white/40'}`} data-testid={`button-tab-${tab.id}`}><Icon className="h-3.5 w-3.5" /> {tab.label}{tab.id === 'problems' && <span className="rounded bg-[hsl(3_73%_52%_/_0.18)] px-1 text-[9px] text-[hsl(3_73%_70%)]">0</span>}</button>; })}
          </div>
          <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <div className="hidden shrink-0 items-center justify-between border-b border-white/10 bg-[hsl(226_29%_18%)] px-4 lg:flex"><div className="flex">{tabs.map((tab) => { const Icon = tab.icon; return <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)} className={`flex items-center gap-2 border-b-2 px-4 py-3 text-[11px] font-medium ${activeTab === tab.id ? 'border-[hsl(166_78%_45%)] text-white' : 'border-transparent text-white/35 hover:text-white/65'}`} data-testid={`button-desktop-tab-${tab.id}`}><Icon className="h-3.5 w-3.5" /> {tab.label}{tab.id === 'problems' && <span className="font-mono text-[9px] text-white/30">0</span>}</button>; })}</div><button className="text-white/35 hover:text-white" data-testid="button-editor-options"><MoreHorizontal className="h-4 w-4" /></button></div>
               {activeTab === 'editor' && <CodeEditor selectedFile={activeFile} content={contents[activeFile] ?? '// Loading the persistent workspace...'} loading={workspaceQuery.isLoading} />}
               {activeTab === 'activity' && <div className="flex min-h-[390px] flex-1 flex-col bg-[hsl(228_31%_14%)] p-5 sm:p-8"><ActivityPanel running={false} fileCount={workspace?.files.filter((file) => file.kind === 'file').length ?? 0} /></div>}
               {activeTab === 'terminal' && <div className="code-surface min-h-[390px] flex-1 bg-[hsl(228_31%_14%)] p-5 text-xs leading-7 text-white/55"><p><span className="text-[hsl(166_78%_60%)]">orbit</span> <span className="text-white/25">~</span> workspace</p><p className="text-white/35">Commands run by Orbit will appear here after you send a request.</p><p className="mt-3"><span className="text-[hsl(166_78%_60%)]">orbit</span> <span className="text-white/25">~</span> <span className="animate-pulse">▋</span></p></div>}
              {activeTab === 'problems' && <div className="flex min-h-[390px] flex-1 flex-col items-center justify-center bg-[hsl(228_31%_14%)] p-6 text-center"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(166_78%_45%_/_0.12)] text-[hsl(166_78%_60%)]"><Check className="h-6 w-6" /></div><h3 className="mt-4 text-sm font-semibold text-white">No problems found</h3><p className="mt-1 max-w-xs text-xs leading-5 text-white/35">Orbit will surface type errors, failed checks, and anything worth your attention here.</p></div>}
               {activeTab === 'editor' && <ActivityPanel running={false} fileCount={workspace?.files.filter((file) => file.kind === 'file').length ?? 0} />}
            </div>
             <AgentPanel initialPrompt={prompt} onWorkspaceUpdate={(nextWorkspace) => setLiveWorkspace(nextWorkspace)} />
          </div>
        </main>
      </div>
       {previewVisible && <PreviewPane workspace={workspace} />}
       <div className="flex h-8 shrink-0 items-center justify-between border-t border-white/10 bg-[hsl(229_35%_10%)] px-4 font-mono text-[9px] text-white/35 sm:px-6"><div className="flex items-center gap-4"><span className="flex items-center gap-1.5 text-[hsl(166_78%_60%)]"><GitBranch className="h-3 w-3" /> {workspace?.branch ?? 'main'}</span><span className="hidden sm:inline">{workspace?.files.filter((file) => file.kind === 'file').length ?? 0} files</span><span className="hidden sm:inline">workspace synced</span></div><span className="flex items-center gap-1.5"><Monitor className="h-3 w-3" /> {workspace?.status ?? 'connecting'}</span></div>
    </div>
  );
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/studio" component={Studio} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
