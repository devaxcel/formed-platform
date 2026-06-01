"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Props {
  trainerId: string;
  sessions: any[];
  payoutRate: number;
}

export default function PayoutRequestButton({ trainerId, sessions, payoutRate }: Props) {
  const supabase = createClient();
  const router   = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    setLoading(true);

    const rows = sessions.map(s => ({
      trainer_id: trainerId,
      session_id: s.id,
      client_id:  s.client_id,
      amount:     payoutRate,
      status:     "requested",
    }));

    await supabase.from("payouts").insert(rows);

    // Mark sessions payout_status as requested
    await Promise.all(
      sessions.map(s =>
        supabase.from("sessions")
          .update({ payout_status: "requested" })
          .eq("id", s.id)
      )
    );

    setLoading(false);
    router.refresh();
  };

  return (
    <button
      onClick={handleRequest}
      disabled={loading}
      className="bg-ink text-cream text-[10px] tracking-widest uppercase font-body px-8 py-3.5 hover:bg-accent transition-colors disabled:opacity-50"
    >
      {loading ? "Requesting..." : `Request Payout for ${sessions.length} Session${sessions.length > 1 ? "s" : ""}`}
    </button>
  );
}