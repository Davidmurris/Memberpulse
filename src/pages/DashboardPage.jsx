import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import AssignSubscriptionModal from "../components/AssignSubscriptionModal";
import { latestSubscription } from "../lib/subscriptionStatus";

function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(dateStr);
  return Math.round((end - today) / (1000 * 60 * 60 * 24));
}

function ScoreSegment({ label, value, tone }) {
  const tones = {
    white: "text-white",
    green: "text-pulse-green",
    amber: "text-pulse-amber",
    red: "text-pulse-red",
  };
  return (
    <div className="flex-1 min-w-[90px] px-4 py-5 text-center sm:text-left">
      <div className={`font-score text-4xl font-bold leading-none ${tones[tone]}`}>{value}</div>
      <div className="text-xs text-white/50 mt-1">{label}</div>
    </div>
  );
}

export default function DashboardPage({ orgId }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renewingMember, setRenewingMember] = useState(null);

  async function loadMembers() {
    setLoading(true);
    const { data, error } = await supabase
      .from("members")
      .select("*, subscriptions(id, end_date, start_date, subscription_plans(name))")
      .eq("org_id", orgId);
    if (!error) setMembers(data);
    setLoading(false);
  }

  useEffect(() => {
    if (orgId) loadMembers();
  }, [orgId]);

  function handleRenewed() {
    setRenewingMember(null);
    loadMembers();
  }

  if (loading) {
    return <p className="text-pulse-ink/50">Loading dashboard...</p>;
  }

  const withStatus = members.map((m) => {
    const sub = latestSubscription(m.subscriptions);
    return { member: m, sub, days: sub ? daysUntil(sub.end_date) : null };
  });

  const activeCount = withStatus.filter((x) => x.days !== null && x.days > 7).length;
  const expiringSoon = withStatus
    .filter((x) => x.days !== null && x.days >= 0 && x.days <= 7)
    .sort((a, b) => a.days - b.days);
  const expired = withStatus
    .filter((x) => x.days !== null && x.days < 0)
    .sort((a, b) => a.days - b.days);
  const noPlan = withStatus.filter((x) => x.sub === null);

  return (
    <div>
      <h1 className="font-score text-3xl font-bold text-pulse-ink mb-6">Dashboard</h1>

      {/* Scoreboard strip — one unified dark bar instead of four separate cards */}
      <div className="bg-pulse-ink rounded-lg flex flex-wrap divide-x divide-white/10 mb-8 overflow-hidden">
        <ScoreSegment label="Total members" value={members.length} tone="white" />
        <ScoreSegment label="Active" value={activeCount} tone="green" />
        <ScoreSegment label="Expiring in 7 days" value={expiringSoon.length} tone="amber" />
        <ScoreSegment label="Expired" value={expired.length} tone="red" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-semibold text-pulse-ink mb-3">Expiring soon</h2>
          {expiringSoon.length === 0 ? (
            <p className="text-sm text-pulse-ink/50 border border-black/10 rounded-lg p-4">
              No one is expiring in the next 7 days.
            </p>
          ) : (
            <div className="border-y border-black/10 divide-y divide-black/10">
              {expiringSoon.map(({ member, days }) => (
                <div key={member.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium text-pulse-ink">{member.name}</div>
                    <div className="text-xs text-pulse-amber font-medium">
                      {days === 0 ? "Expires today" : `Expires in ${days} day${days === 1 ? "" : "s"}`}
                    </div>
                  </div>
                  <button
                    onClick={() => setRenewingMember(member)}
                    className="text-sm text-pulse-green font-medium hover:underline"
                  >
                    Renew
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-semibold text-pulse-ink mb-3">Already expired</h2>
          {expired.length === 0 ? (
            <p className="text-sm text-pulse-ink/50 border border-black/10 rounded-lg p-4">
              No expired members right now.
            </p>
          ) : (
            <div className="border-y border-black/10 divide-y divide-black/10">
              {expired.map(({ member, days }) => (
                <div key={member.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium text-pulse-ink">{member.name}</div>
                    <div className="text-xs text-pulse-red font-medium">
                      Expired {Math.abs(days)} day{Math.abs(days) === 1 ? "" : "s"} ago
                    </div>
                  </div>
                  <button
                    onClick={() => setRenewingMember(member)}
                    className="text-sm text-pulse-green font-medium hover:underline"
                  >
                    Renew
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {noPlan.length > 0 && (
        <div className="mt-6">
          <h2 className="font-semibold text-pulse-ink mb-3">No plan assigned</h2>
          <div className="border-y border-black/10 divide-y divide-black/10">
            {noPlan.map(({ member }) => (
              <div key={member.id} className="flex items-center justify-between py-3">
                <div className="font-medium text-pulse-ink">{member.name}</div>
                <button
                  onClick={() => setRenewingMember(member)}
                  className="text-sm text-pulse-green font-medium hover:underline"
                >
                  Assign plan
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {renewingMember && (
        <AssignSubscriptionModal
          orgId={orgId}
          member={renewingMember}
          onClose={() => setRenewingMember(null)}
          onSaved={handleRenewed}
        />
      )}
    </div>
  );
}
