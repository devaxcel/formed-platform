"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface PayNowButtonProps {
  sessionId: string;
}

export default function PayNowButton({ sessionId }: PayNowButtonProps) {
  const supabase = createClient();
  const router   = useRouter();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handlePay = async () => {
    setLoading(true);
    setError("");

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/payments/pay-session`,
      {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ session_id: sessionId }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Payment failed");
      setLoading(false);
      return;
    }

    if (data.status === "succeeded") {
      router.refresh();
    } else {
      setError("Payment requires additional authentication. Please update your payment method.");
    }

    setLoading(false);
  };

  return (
    <div>
      {error && (
        <p className="text-red-500 text-xs font-body mb-2">{error}</p>
      )}
      <button
        onClick={handlePay}
        disabled={loading}
        className="text-[10px] tracking-widest uppercase font-body bg-ink text-cream px-5 py-2.5 hover:bg-accent transition-colors disabled:opacity-50"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </div>
  );
}