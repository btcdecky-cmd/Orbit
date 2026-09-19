const points = [38, 52, 44, 61, 56, 72, 68];

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
}