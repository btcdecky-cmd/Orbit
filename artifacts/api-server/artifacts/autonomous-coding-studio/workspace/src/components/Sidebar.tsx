export function Sidebar({ activeView, onViewChange }) {
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
}