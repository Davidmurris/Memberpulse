import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AssignSubscriptionModal({ orgId, member, onClose, onSaved }) {
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPlans() {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("org_id", orgId)
        .order("created_at", { ascending: true });
      if (!error && data.length > 0) {
        setPlans(data);
        setSelectedPlanId(data[0].id);
      }
      setLoadingPlans(false);
    }
    loadPlans();
  }, [orgId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!selectedPlanId) return setError("Choose a plan first.");
    setLoading(true);

    const plan = plans.find((p) => p.id === selectedPlanId);
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + plan.duration_days);

    const { error } = await supabase.from("subscriptions").insert({
      member_id: member.id,
      plan_id: plan.id,
      start_date: startDate.toISOString().slice(0, 10),
      end_date: endDate.toISOString().slice(0, 10),
      status: "active",
    });

    setLoading(false);
    if (error) return setError(error.message);
    onSaved();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-sm p-6">
        <h3 className="text-lg font-semibold text-pulse-ink mb-1">Assign a plan</h3>
        <p className="text-sm text-pulse-ink/60 mb-4">For {member.name}</p>

        {loadingPlans ? (
          <p className="text-pulse-ink/50 text-sm">Loading plans...</p>
        ) : plans.length === 0 ? (
          <p className="text-sm text-pulse-ink/60">
            You don't have any plans yet. Close this and create one on the Plans tab first.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-pulse-ink mb-1">Plan</label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full rounded-md border border-black/15 px-3 py-2 bg-white focus:border-pulse-green"
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.duration_days} days — {Number(p.price).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-black/15 rounded-md py-2 text-pulse-ink hover:bg-black/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-pulse-green hover:bg-pulse-green-dark text-white rounded-md py-2 font-medium disabled:opacity-60"
              >
                {loading ? "Saving..." : "Assign"}
              </button>
            </div>
          </form>
        )}

        {plans.length === 0 && (
          <button
            onClick={onClose}
            className="mt-4 w-full border border-black/15 rounded-md py-2 text-pulse-ink hover:bg-black/5"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}
