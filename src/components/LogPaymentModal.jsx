import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function LogPaymentModal({ member, onClose, onSaved }) {
  const [amount, setAmount] = useState("");
  const [datePaid, setDatePaid] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!amount || Number(amount) <= 0) return setError("Enter a valid amount.");
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("payments").insert({
      member_id: member.id,
      amount: Number(amount),
      date_paid: datePaid,
      payment_method: "manual",
      note: note || null,
      logged_by: user?.id ?? null,
    });

    setLoading(false);
    if (error) return setError(error.message);
    onSaved();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-sm p-6">
        <h3 className="text-lg font-semibold text-pulse-ink mb-1">Log a payment</h3>
        <p className="text-sm text-pulse-ink/60 mb-4">For {member.name}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-pulse-ink mb-1">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
              placeholder="e.g. 15000"
              className="w-full rounded-md border border-black/15 px-3 py-2 focus:border-pulse-green"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-pulse-ink mb-1">Date paid</label>
            <input
              type="date"
              value={datePaid}
              onChange={(e) => setDatePaid(e.target.value)}
              className="w-full rounded-md border border-black/15 px-3 py-2 focus:border-pulse-green"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-pulse-ink mb-1">Note (optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Cash at front desk"
              className="w-full rounded-md border border-black/15 px-3 py-2 focus:border-pulse-green"
            />
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
              {loading ? "Saving..." : "Log payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
