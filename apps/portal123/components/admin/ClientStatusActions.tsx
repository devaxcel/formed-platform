"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const ACTIONS = [
  { label: "Approve",        status: "approved",      style: "bg-ink text-cream hover:bg-accent" },
  { label: "Under Review",   status: "under_review",  style: "bg-stone text-ink hover:bg-warm" },
  { label: "Waitlist",       status: "waitlisted",    style: "bg-stone text-ink hover:bg-warm" },
  { label: "Reject",         status: "rejected",      style: "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100" },
  { label: "Ready for Match",status: "ready_for_match",style: "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100" },
];

export default function ClientStatusActions({
  clientId, currentStatus
}: { clientId: string; currentStatus: string }) {
  const supabase = createClient();
  const router   = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  const updateStatus = async (status: string) => {
    setLoading(status);
    setError("");
    
    // Get the current session token
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    // ✅ FIX: Use the Railway API URL
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://formed-platform-production.up.railway.app";
    
    try {
      // Call your backend API instead of direct Supabase
      const response = await fetch(`${API_URL}/api/clients/${clientId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update status");
      }
      
      // Refresh the page to show updated status
      router.refresh();
    } catch (err: any) {
      console.error("Error updating status:", err);
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      {error && (
        <p className="text-red-500 text-xs font-body mb-2">{error}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {ACTIONS.map(a => (
          <button key={a.status}
            onClick={() => updateStatus(a.status)}
            disabled={loading === a.status || currentStatus === a.status}
            className={`text-[10px] tracking-widest uppercase font-body px-5 py-2.5 transition-colors disabled:opacity-40 ${a.style}`}>
            {loading === a.status ? "Saving..." : a.label}
          </button>
        ))}
      </div>
    </div>
  );
}