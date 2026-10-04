import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function PlanFormModal({ orgId, plan, onClose, onSaved }) {
  const isEditing = Boolean(plan);
  const [name, setName] = useState(plan?.name ?? "");
  const [durationDays, setDurationDays] = useState(plan?.duration_days ?? 30);
  const [price, setPrice] = useState(plan?.price ?? "");
  const [paymentLinkUrl, setPaymentLinkUrl] = useState(plan?.payment_link_url ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Give this plan a name.");
    if (!durationDays || durationDays <= 0) return setError("Duration must be a positive number of days.");
    if (price === "" || Number(price) < 0) return setError("Enter a valid price.");
    setLoading(true);

    if (isEditing) {
      const { error } = await supabase
        .from("subscription_plans")
        .update({
          name,
          duration_days: Number(durationDays),
          price: Number(price),
          payment_link_url: paymentLinkUrl || null,
        })
        .eq("id", plan.id);
      setLoading(false);
      if (error) return setError(error.message);
    } else {
      const { error } = await supabase.from("subscription_plans").insert({
        org_id: orgId,
        name,
        duration_days: Number(durationDays),
        price: Number(price),
        payment_link_url: paymentLinkUrl || null,
      });
      setLoading(false);
      if (error) return setError(error.message);
    }

    onSaved();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-sm p-6">
        <h3 className="text-lg font-semibold text-pulse-ink mb-4">
          {isEditing ? "Edit plan" : "Add plan"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-pulse-ink mb-1">Plan name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Monthly"
              className="w-full rounded-md border border-black/15 px-3 py-2 focus:border-pulse-green"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-pulse-ink mb-1">Duration (days)</label>
            <input
              type="number"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              min="1"
              className="w-full rounded-md border border-black/15 px-3 py-2 focus:border-pulse-green"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-pulse-ink mb-1">Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              step="0.01"
              placeholder="e.g. 15000"
              className="w-full rounded-md border border-black/15 px-3 py-2 focus:border-pulse-green"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-pulse-ink mb-1">
              Payment link (optional)
            </label>
            <input
              type="url"
              value={paymentLinkUrl}
              onChange={(e) => setPaymentLinkUrl(e.target.value)}
              placeholder="https://paystack.com/pay/..."
              className="w-full rounded-md border border-black/15 px-3 py-2 focus:border-pulse-green"
            />
            <p className="text-xs text-pulse-ink/50 mt-1">
              Paste your Paystack Payment Page link for this plan. You can add this later.
            </p>
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
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
