import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AuthScreen({ onAuthed }) {
  const [mode, setMode] = useState("signin");
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignIn(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    onAuthed(data.user);
  }

  async function handleSignUp(e) {
    e.preventDefault();
    setError("");
    if (!orgName.trim()) return setError("Give your gym or business a name first.");
    setLoading(true);

    // The organization and org_admins link are created automatically by a
    // database trigger the instant this user is created — see
    // supabase_auto_org_trigger.sql. We just pass the org name along.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { org_name: orgName } },
    });

    setLoading(false);
    if (error) return setError(error.message);
    onAuthed(data.user);
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="hidden md:flex md:w-5/12 bg-pulse-ink text-white flex-col justify-between p-12">
        <div className="font-score text-2xl font-bold tracking-wide text-pulse-green">
          MemberPulse
        </div>
        <div>
          <h1 className="font-score text-5xl leading-tight font-bold mb-4 max-w-sm">
            Know exactly who's paid, and who isn't, at a glance.
          </h1>
          <p className="text-white/70 max-w-sm leading-relaxed">
            Built for gyms and small businesses that are done chasing
            renewals through a notebook or a spreadsheet.
          </p>
        </div>
        <p className="text-white/40 text-sm">Works on any phone, even on a slow connection.</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-pulse-bg">
        <div className="w-full max-w-sm">
          <div className="md:hidden mb-8 font-score text-2xl font-bold text-pulse-green">
            MemberPulse
          </div>

          <h2 className="text-2xl font-semibold text-pulse-ink mb-1">
            {mode === "signin" ? "Welcome back" : "Set up your organization"}
          </h2>
          <p className="text-pulse-ink/60 mb-6 text-sm">
            {mode === "signin"
              ? "Sign in to your MemberPulse dashboard."
              : "Takes about a minute. No card required."}
          </p>

          <form onSubmit={mode === "signin" ? handleSignIn : handleSignUp} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-pulse-ink mb-1">
                  Gym or business name
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Ironclad Fitness"
                  className="w-full rounded-md border border-black/15 px-3 py-2 bg-white focus:border-pulse-green"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-pulse-ink mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-md border border-black/15 px-3 py-2 bg-white focus:border-pulse-green"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-pulse-ink mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                minLength={6}
                className="w-full rounded-md border border-black/15 px-3 py-2 bg-white focus:border-pulse-green"
                required
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pulse-green hover:bg-pulse-green-dark text-white font-medium rounded-md py-2.5 transition-colors disabled:opacity-60"
            >
              {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="text-sm text-pulse-ink/60 mt-6">
            {mode === "signin" ? "New to MemberPulse?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setError("");
                setMode(mode === "signin" ? "signup" : "signin");
              }}
              className="text-pulse-green font-medium hover:underline"
            >
              {mode === "signin" ? "Create an organization" : "Sign in instead"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
