"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface ChargeSessionButtonProps {
  sessionId:     string;
  currentStatus: string;
}

export default function ChargeSessionButton({
  sessionId, currentStatus
}: ChargeSessionButtonProps) {
  const supabase = createClient();
  const router   = useRouter();
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState<{ status: string; amount?: number } | null>(null);
  const [error,   setError]   = useState("");

  const canCharge = ["admin_confirmed", "payment_pending"].includes(currentStatus);

  const handleCharge = async () => {
    setLoading(true);
    setError("");

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    // Debug logging
    console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
    console.log('Full URL:', `${process.env.NEXT_PUBLIC_API_URL}/api/payments/charge-session`);
    console.log('Token exists:', !!token);
    console.log('Session ID:', sessionId);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/charge-session`,
        {
          method:  "POST",
          headers: {
            "Content-Type":  "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ session_id: sessionId }),
        }
      );

      console.log('Response status:', res.status);

      // Check if response is JSON
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        
        if (!res.ok) {
          setError(data.error ?? "Charge failed");
        } else {
          setResult(data);
          router.refresh();
        }
      } else {
        const text = await res.text();
        console.error('Non-JSON response:', text.substring(0, 200));
        setError(`Server error: ${res.status}`);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to connect to payment service');
    } finally {
      setLoading(false);
    }
  };

  if (!canCharge) return null;

  return (
    <div className="mt-2">
      {error && (
        <p className="text-red-500 text-xs font-body mb-2">{error}</p>
      )}
      {result ? (
        <p className="text-green-600 text-xs font-body">
          {result.status === "succeeded"
            ? `Payment of $${result.amount} collected successfully.`
            : `Payment pending — status: ${result.status}`}
        </p>
      ) : (
        <button
          onClick={handleCharge}
          disabled={loading}
          className="text-[10px] tracking-widest uppercase font-body bg-green-600 text-white px-5 py-2.5 hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Charging..." : "Charge Client"}
        </button>
      )}
    </div>
  );
}