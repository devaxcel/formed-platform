"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link href="/auth/login"
          className="text-[10px] tracking-widest uppercase text-muted hover:text-cream transition-colors font-body mb-10 block">
          &larr; Back to sign in
        </Link>
        <h1 className="font-display text-4xl font-light text-cream mb-2">
          Reset password
        </h1>
        <p className="text-muted text-sm font-body mb-8 leading-relaxed">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        {sent ? (
          <div className="bg-green-900/30 border border-green-500/30 text-green-300 text-sm px-4 py-4 font-body">
            Check your email for a password reset link.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="email" required
              className="w-full bg-cream/5 border border-cream/20 text-cream placeholder:text-muted text-sm px-4 py-3 focus:outline-none focus:border-cream/50 font-body"
              placeholder="you@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <button type="submit" disabled={loading}
              className="w-full bg-cream text-ink text-[10px] tracking-widest uppercase font-body font-medium py-4 hover:bg-stone transition-colors disabled:opacity-50">
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}