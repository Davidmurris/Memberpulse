import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export function useOrganization(user) {
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchOrg() {
      setLoading(true);
      const { data, error } = await supabase
        .from("org_admins")
        .select("organizations(*)")
        .eq("user_id", user.id)
        .single();

      if (cancelled) return;

      if (error) {
        setError(error.message);
      } else {
        setOrg(data.organizations);
      }
      setLoading(false);
    }

    fetchOrg();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return { org, loading, error };
}
