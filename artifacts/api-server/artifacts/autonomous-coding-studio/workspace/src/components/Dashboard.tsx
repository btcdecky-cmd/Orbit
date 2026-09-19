import { ActivityChart } from "./ActivityChart";
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
}