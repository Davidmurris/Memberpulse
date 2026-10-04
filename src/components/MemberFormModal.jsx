import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function MemberFormModal({ orgId, member, onClose, onSaved }) {
  const isEditing = Boolean(member);
  const [name, setName] = useState(member?.name ?? "");
  const [email, setEmail] = useState(member?.email ?? "");
  const [phone, setPhone] = useState(member?.phone ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Name is required.");
    setLoading(true);

    if (isEditing) {
      const { error } = await supabase
        .from("members")
        .update({ name, email, phone })
        .eq("id", member.id);
      setLoading(false);
      if (error) return setError(error.message);
    } else {
      const { error } = await supabase
        .from("members")
        .insert({ org_id: orgId, name, email, phone });
      setLoading(false);
      if (error) return setError(error.message);
    }

    onSaved();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-sm p-6">
        <h3 className="text-lg font-semibold text-pulse-ink mb-4">
          {isEditing ? "Edit member" : "Add member"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-pulse-ink mb-1">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-black/15 px-3 py-2 focus:border-pulse-green"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-pulse-ink mb-1">
              Email (optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-black/15 px-3 py-2 focus:border-pulse-green"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-pulse-ink mb-1">
              Phone (optional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
