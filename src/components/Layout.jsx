import { supabase } from "../lib/supabaseClient";

export default function Layout({ orgName, activeTab, onTabChange, children }) {
  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  const tabs = [
    { key: "dashboard", label: "Dashboard" },
    { key: "members", label: "Members" },
    { key: "plans", label: "Plans" },
    { key: "payments", label: "Payments" },
  ];

  return (
    <div className="min-h-screen bg-pulse-bg">
      <header className="bg-pulse-ink text-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <div className="font-score text-2xl font-bold tracking-wide text-pulse-green">
              MemberPulse
            </div>
            <div className="text-xs text-white/50">{orgName}</div>
          </div>
          <button onClick={handleSignOut} className="text-sm text-white/60 hover:text-white underline">
            Sign out
          </button>
        </div>
        <div className="max-w-5xl mx-auto px-6 flex gap-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-pulse-green text-white"
                  : "border-transparent text-white/50 hover:text-white/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
