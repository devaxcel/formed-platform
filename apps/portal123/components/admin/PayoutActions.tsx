"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function PayoutActions({
  payoutId, currentStatus
}: { payoutId: string; currentStatus: string }) {
  const supabase = createClient();
  const router   = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const update = async (status: string) => {
    setLoading(status);
    await supabase.from("payouts").update({
      status,
      ...(status === "approved" ? { approved_at: new Date().toISOString() } : {}),
      ...(status === "paid"     ? { paid_at:     new Date().toISOString() } : {}),
    }).eq("id", payoutId);
    router.refresh();
    setLoading(null);
  };

  if (currentStatus !== "requested" && currentStatus !== "approved") return null;

  return (
    <div className="flex gap-2">
      {currentStatus === "requested" && (
        <>
          <button onClick={() => update("approved")} disabled={!!loading}
            className="text-[10px] tracking-widests uppercase font-body bg-ink text-cream px-4 py-2 hover:bg-accent transition-colors disabled:opacity-50">
            {loading === "approved" ? "..." : "Approve"}
          </button>
          <button onClick={() => update("rejected")} disabled={!!loading}
            className="text-[10px] tracking-widests uppercase font-body bg-stone text-muted px-4 py-2 hover:bg-warm transition-colors disabled:opacity-50">
            {loading === "rejected" ? "..." : "Reject"}
          </button>
        </>
      )}
      {currentStatus === "approved" && (
        <div>
          <p className="text-[10px] text-muted font-body mb-2">Process payment outside platform, then:</p>
          <button onClick={() => update("paid")} disabled={!!loading}
            className="text-[10px] tracking-widests uppercase font-body bg-green-600 text-white px-4 py-2 hover:bg-green-700 transition-colors disabled:opacity-50">
            {loading === "paid" ? "..." : "Confirm Paid"}
          </button>
        </div>
      )}
    </div>
  );
}