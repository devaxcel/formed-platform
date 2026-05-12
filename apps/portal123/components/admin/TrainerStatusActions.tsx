"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const ACTIONS = [
  { label: "Approve — Pending Docs",     status: "approved_pending_docs",      style: "bg-stone text-ink hover:bg-warm" },
  { label: "Approve — Pending Training", status: "approved_pending_training",   style: "bg-stone text-ink hover:bg-warm" },
  { label: "Interview Requested",        status: "interview_requested",         style: "bg-stone text-ink hover:bg-warm" },
  { label: "Activate",                   status: "active",                      style: "bg-ink text-cream hover:bg-accent" },
  { label: "Restrict",                   status: "restricted",                  style: "bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100" },
  { label: "Reject",                     status: "rejected",                    style: "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100" },
];

export default function TrainerStatusActions({
  trainerId, currentStatus
}: { trainerId: string; currentStatus: string }) {
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
    
    // ✅ Use the Railway API URL
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://formed-platform-production.up.railway.app";
    
    try {
      // Call your backend API instead of direct Supabase
      const response = await fetch(`${API_URL}/api/trainers/${trainerId}`, {
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
            className={`text-[10px] tracking-widest uppercase font-body px-4 py-2.5 transition-colors disabled:opacity-40 ${a.style}`}>
            {loading === a.status ? "Saving..." : a.label}
          </button>
        ))}
      </div>
    </div>
  );
}