import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import MemberFormModal from "../components/MemberFormModal";
import AssignSubscriptionModal from "../components/AssignSubscriptionModal";
import LogPaymentModal from "../components/LogPaymentModal";
import { getStatusInfo, latestSubscription } from "../lib/subscriptionStatus";

export default function MembersPage({ orgId }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [assigningMember, setAssigningMember] = useState(null);
  const [loggingPaymentMember, setLoggingPaymentMember] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  async function loadMembers() {
    setLoading(true);
    const { data, error } = await supabase
      .from("members")
      .select("*, subscriptions(id, end_date, start_date, subscription_plans(name, payment_link_url))")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });
    if (!error) setMembers(data);
    setLoading(false);
  }

  useEffect(() => {
    if (orgId) loadMembers();
  }, [orgId]);

  function openAddModal() {
    setEditingMember(null);
    setModalOpen(true);
  }

  function openEditModal(member) {
    setEditingMember(member);
    setModalOpen(true);
  }

  function handleSaved() {
    setModalOpen(false);
    loadMembers();
  }

  function handleAssigned() {
    setAssigningMember(null);
    loadMembers();
  }

  function handlePaymentLogged() {
    setLoggingPaymentMember(null);
    loadMembers();
  }

  async function handleCopyLink(member, link) {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(member.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      window.prompt("Copy this link:", link);
    }
  }

  async function handleDelete(member) {
    const confirmed = window.confirm(`Remove ${member.name}? This can't be undone.`);
    if (!confirmed) return;
    const { error } = await supabase.from("members").delete().eq("id", member.id);
    if (!error) loadMembers();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-score text-3xl font-bold text-pulse-ink">Members</h1>
        <button
          onClick={openAddModal}
          className="bg-pulse-green hover:bg-pulse-green-dark text-white rounded-md px-4 py-2 text-sm font-medium"
        >
          + Add member
        </button>
      </div>

      {loading ? (
        <p className="text-pulse-ink/50">Loading members...</p>
      ) : members.length === 0 ? (
        <div className="border border-black/10 rounded-lg p-10 text-center">
          <p className="text-pulse-ink/60 mb-4">No members yet.</p>
          <button onClick={openAddModal} className="text-pulse-green font-medium hover:underline">
            Add your first member
          </button>
        </div>
      ) : (
        <>
          {/* Card layout — small screens */}
          <div className="sm:hidden space-y-3">
            {members.map((m) => {
              const sub = latestSubscription(m.subscriptions);
              const status = getStatusInfo(sub);
              const paymentLink = sub?.subscription_plans?.payment_link_url;
              return (
                <div key={m.id} className="border border-black/10 rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium text-pulse-ink">{m.name}</div>
                      <div className="text-xs text-pulse-ink/50">{m.email || m.phone || "—"}</div>
                    </div>
                    <span className={`shrink-0 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="text-sm text-pulse-ink/70 mb-3">
                    Plan: {sub?.subscription_plans?.name ?? "—"}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm border-t border-black/5 pt-3">
                    {paymentLink && (
                      <button onClick={() => handleCopyLink(m, paymentLink)} className="text-amber-700">
                        {copiedId === m.id ? "Copied!" : "Copy pay link"}
                      </button>
                    )}
                    <button onClick={() => setLoggingPaymentMember(m)} className="text-pulse-green">
                      Log payment
                    </button>
                    <button onClick={() => setAssigningMember(m)} className="text-pulse-ink/70">
                      {sub ? "Renew" : "Assign plan"}
                    </button>
                    <button onClick={() => openEditModal(m)} className="text-pulse-ink/70">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(m)} className="text-pulse-red">
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Row list — sm screens and up */}
          <div className="hidden sm:block border-y border-black/10 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-pulse-ink/50 text-left">
                <tr>
                  <th className="py-3 font-medium">Name</th>
                  <th className="py-3 font-medium">Plan</th>
                  <th className="py-3 font-medium">Status</th>
                  <th className="py-3 font-medium">Contact</th>
                  <th className="py-3"></th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => {
                  const sub = latestSubscription(m.subscriptions);
                  const status = getStatusInfo(sub);
                  const paymentLink = sub?.subscription_plans?.payment_link_url;
                  return (
                    <tr key={m.id} className="border-t border-black/10">
                      <td className="py-3 font-medium text-pulse-ink">{m.name}</td>
                      <td className="py-3 text-pulse-ink/70">
                        {sub?.subscription_plans?.name ?? "—"}
                      </td>
                      <td className="py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="py-3 text-pulse-ink/70">{m.email || m.phone || "—"}</td>
                      <td className="py-3 text-right space-x-3 whitespace-nowrap">
                        {paymentLink && (
                          <button
                            onClick={() => handleCopyLink(m, paymentLink)}
                            className="text-amber-700 hover:underline"
                          >
                            {copiedId === m.id ? "Copied!" : "Copy pay link"}
                          </button>
                        )}
                        <button
                          onClick={() => setLoggingPaymentMember(m)}
                          className="text-pulse-green hover:underline"
                        >
                          Log payment
                        </button>
                        <button
                          onClick={() => setAssigningMember(m)}
                          className="text-pulse-ink/70 hover:underline"
                        >
                          {sub ? "Renew" : "Assign plan"}
                        </button>
                        <button onClick={() => openEditModal(m)} className="text-pulse-ink/70 hover:underline">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(m)} className="text-pulse-red hover:underline">
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {modalOpen && (
        <MemberFormModal
          orgId={orgId}
          member={editingMember}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}

      {assigningMember && (
        <AssignSubscriptionModal
          orgId={orgId}
          member={assigningMember}
          onClose={() => setAssigningMember(null)}
          onSaved={handleAssigned}
        />
      )}

      {loggingPaymentMember && (
        <LogPaymentModal
          member={loggingPaymentMember}
          onClose={() => setLoggingPaymentMember(null)}
          onSaved={handlePaymentLogged}
        />
      )}
    </div>
  );
}
