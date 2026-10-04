import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import { useOrganization } from "./lib/useOrganization";
import AuthScreen from "./components/AuthScreen";
import Layout from "./components/Layout";
import MembersPage from "./pages/MembersPage";
import PlansPage from "./pages/PlansPage";
import DashboardPage from "./pages/DashboardPage";
import PaymentsPage from "./pages/PaymentsPage";

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const { org, loading: orgLoading, error: orgError } = useOrganization(user);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setCheckingSession(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center text-pulse-ink/50">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onAuthed={setUser} />;
  }

  if (orgLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-pulse-ink/50">
        Loading your organization...
      </div>
    );
  }

  if (orgError || !org) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 gap-4">
        <p className="text-red-600 max-w-sm">
          Couldn't load your organization: {orgError || "not found"}
        </p>
        <button
          onClick={() => supabase.auth.signOut()}
          className="text-sm text-pulse-ink/60 underline hover:text-pulse-ink"
        >
          Sign out and try a different account
        </button>
      </div>
    );
  }

  return (
    <Layout orgName={org.name} activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === "dashboard" && <DashboardPage orgId={org.id} />}
      {activeTab === "members" && <MembersPage orgId={org.id} />}
      {activeTab === "plans" && <PlansPage orgId={org.id} />}
      {activeTab === "payments" && <PaymentsPage orgId={org.id} />}
    </Layout>
  );
}
