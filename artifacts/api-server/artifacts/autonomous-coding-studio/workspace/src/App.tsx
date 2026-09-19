import { useState } from "react";
import { Dashboard } from "./components/Dashboard";

export default function App() {
  const [activeView, setActiveView] = useState("overview");

  return (
    <main className="min-h-screen bg-canvas">
      <Dashboard activeView={activeView} onViewChange={setActiveView} />
    </main>
  );
}