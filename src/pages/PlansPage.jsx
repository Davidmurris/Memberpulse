import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import PlanFormModal from "../components/PlanFormModal";

export default function PlansPage({ orgId }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  async function loadPlans() {
    setLoading(true);
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: true });
    if (!error) setPlans(data);
    setLoading(false);
  }

  useEffect(() => {
    if (orgId) loadPlans();
  }, [orgId]);

  function openAddModal() {
    setEditingPlan(null);
    setModalOpen(true);
  }

  function openEditModal(plan) {
    setEditingPlan(plan);
    setModalOpen(true);
  }

  function handleSaved() {
    setModalOpen(false);
    loadPlans();
  }

  async function handleDelete(plan) {
    const confirmed = window.confirm(
      `Delete the "${plan.name}" plan? Members already on it keep their current subscription, but you won't be able to assign it to anyone new.`
    );
    if (!confirmed) return;
    const { error } = await supabase.from("subscription_plans").delete().eq("id", plan.id);
    if (!error) loadPlans();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-score text-3xl font-bold text-pulse-ink">Subscription plans</h1>
        <button
          onClick={openAddModal}
          className="bg-pulse-green hover:bg-pulse-green-dark text-white rounded-md px-4 py-2 text-sm font-medium"
        >
          + Add plan
        </button>
      </div>

      {loading ? (
        <p className="text-pulse-ink/50">Loading plans...</p>
      ) : plans.length === 0 ? (
        <div className="border border-black/10 rounded-lg p-10 text-center">
          <p className="text-pulse-ink/60 mb-4">
            No plans yet. Create one (e.g. "Monthly") before assigning it to members.
          </p>
          <button onClick={openAddModal} className="text-pulse-green font-medium hover:underline">
            Add your first plan
          </button>
        </div>
      ) : (
        <>
          {/* Card layout — small screens */}
          <div className="sm:hidden space-y-3">
            {plans.map((p) => (
              <div key={p.id} className="border border-black/10 rounded-lg p-4 bg-white">
                <div className="font-medium text-pulse-ink mb-1">{p.name}</div>
                <div className="text-sm text-pulse-ink/70 mb-3">
                  {p.duration_days} days · {Number(p.price).toLocaleString()}
                </div>
                <div className="flex gap-4 text-sm border-t border-black/5 pt-3">
                  <button onClick={() => openEditModal(p)} className="text-pulse-green">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(p)} className="text-pulse-red">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Row list — sm screens and up */}
          <div className="hidden sm:block border-y border-black/10 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-pulse-ink/50 text-left">
                <tr>
                  <th className="py-3 font-medium">Name</th>
                  <th className="py-3 font-medium">Duration</th>
                  <th className="py-3 font-medium">Price</th>
                  <th className="py-3"></th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p.id} className="border-t border-black/10">
                    <td className="py-3 font-medium text-pulse-ink">{p.name}</td>
                    <td className="py-3 text-pulse-ink/70">{p.duration_days} days</td>
                    <td className="py-3 text-pulse-ink/70">{Number(p.price).toLocaleString()}</td>
                    <td className="py-3 text-right space-x-3 whitespace-nowrap">
                      <button onClick={() => openEditModal(p)} className="text-pulse-green hover:underline">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(p)} className="text-pulse-red hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {modalOpen && (
        <PlanFormModal
          orgId={orgId}
          plan={editingPlan}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
