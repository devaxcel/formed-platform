"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface RefundButtonProps {
  paymentId: string;
  amount:    number;
}

export default function RefundButton({ paymentId, amount }: RefundButtonProps) {
  const supabase  = createClient();
  const router    = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState("");

  const handleRefund = async () => {
    setLoading(true);
    setError("");

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/payments/refund`,
      {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          payment_id: paymentId,
          reason:     "Admin-initiated refund",
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Refund failed");
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
    setConfirm(false);
    router.refresh();
  };

  if (done) {
    return (
      <p className="text-green-600 text-xs font-body">Refund issued.</p>
    );
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <p className="text-xs font-body text-ink">Refund ${amount}?</p>
        <button
          onClick={handleRefund}
          disabled={loading}
          className="text-[10px] tracking-widests uppercase font-body bg-red-600 text-white px-4 py-2 hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Processing..." : "Confirm"}
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="text-[10px] tracking-widests uppercase font-body bg-stone text-muted px-4 py-2"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div>
      {error && <p className="text-red-500 text-xs font-body mb-1">{error}</p>}
      <button
        onClick={() => setConfirm(true)}
        className="text-[10px] tracking-widests uppercase font-body text-red-600 hover:text-red-800 transition-colors font-body"
      >
        Issue Refund
      </button>
    </div>
  );
}