import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function PaymentsPage({ orgId }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      setLoading(true);
      const { data, error } = await supabase
        .from("payments")
        .select("*, members!inner(name, org_id)")
        .eq("members.org_id", orgId)
        .order("date_paid", { ascending: false });
      if (!error) setPayments(data);
      setLoading(false);
    }
    if (orgId) loadPayments();
  }, [orgId]);

  const total = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-score text-3xl font-bold text-pulse-ink">Payments</h1>
        <div className="text-sm text-pulse-ink/60">
          Total logged:{" "}
          <span className="font-score text-lg font-bold text-pulse-green">
            {total.toLocaleString()}
          </span>
        </div>
      </div>

      {loading ? (
        <p className="text-pulse-ink/50">Loading payments...</p>
      ) : payments.length === 0 ? (
        <div className="border border-black/10 rounded-lg p-10 text-center">
          <p className="text-pulse-ink/60">
            No payments logged yet. Log one from a member's row on the Members tab.
          </p>
        </div>
      ) : (
        <>
          {/* Card layout — small screens */}
          <div className="sm:hidden space-y-3">
            {payments.map((p) => (
              <div key={p.id} className="border border-black/10 rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between mb-1">
                  <div className="font-medium text-pulse-ink">{p.members?.name ?? "—"}</div>
                  <div className="font-score text-lg font-bold text-pulse-ink">
                    {Number(p.amount).toLocaleString()}
                  </div>
                </div>
                <div className="text-xs text-pulse-ink/50">
                  {new Date(p.date_paid).toLocaleDateString()} ·{" "}
                  <span className="capitalize">{p.payment_method}</span>
                  {p.note ? ` · ${p.note}` : ""}
                </div>
              </div>
            ))}
          </div>

          {/* Row list — sm screens and up */}
          <div className="hidden sm:block border-y border-black/10 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-pulse-ink/50 text-left">
                <tr>
                  <th className="py-3 font-medium">Member</th>
                  <th className="py-3 font-medium">Amount</th>
                  <th className="py-3 font-medium">Date</th>
                  <th className="py-3 font-medium">Method</th>
                  <th className="py-3 font-medium">Note</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-t border-black/10">
                    <td className="py-3 font-medium text-pulse-ink">{p.members?.name ?? "—"}</td>
                    <td className="py-3 text-pulse-ink/70">{Number(p.amount).toLocaleString()}</td>
                    <td className="py-3 text-pulse-ink/70">
                      {new Date(p.date_paid).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-pulse-ink/70 capitalize">{p.payment_method}</td>
                    <td className="py-3 text-pulse-ink/50">{p.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
