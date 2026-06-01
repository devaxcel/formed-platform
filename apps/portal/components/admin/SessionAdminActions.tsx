"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const ACTIONS = [
  { label: "Confirm Booking",   status: "admin_confirmed",  style: "bg-ink text-cream hover:bg-accent" },
  { label: "Mark Completed",    status: "completed",         style: "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100" },
  { label: "Mark No-Show",      status: "no_show",           style: "bg-orange-50 text-orange-700 border border-orange-200" },
  { label: "Cancel Session",    status: "cancelled",         style: "bg-red-50 text-red-700 border border-red-200" },
];

export default function SessionAdminActions({
  sessionId, currentStatus
}: { sessionId: string; currentStatus: string }) {
  const supabase = createClient();
  const router   = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const updateStatus = async (status: string) => {
    setLoading(status);
    await supabase.from("sessions").update({
      booking_status: status,
      updated_at: new Date().toISOString(),
    }).eq("id", sessionId);
    router.refresh();
    setLoading(null);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {ACTIONS.map(a => (
        <button key={a.status}
          onClick={() => updateStatus(a.status)}
          disabled={loading === a.status || currentStatus === a.status}
          className={`text-[10px] tracking-widests uppercase font-body px-5 py-2.5 transition-colors disabled:opacity-40 ${a.style}`}>
          {loading === a.status ? "Saving..." : a.label}
        </button>
      ))}
    </div>
  );
}