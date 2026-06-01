"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    
    // Redirect to login after 3 seconds
    setTimeout(() => {
      router.push("/auth/login");
    }, 3000);
  };

  const field = "w-full bg-cream/5 border border-cream/20 text-cream placeholder:text-muted text-sm px-4 py-3 focus:outline-none focus:border-cream/50 transition-colors font-body";

  if (success) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="bg-green-900/30 border border-green-500/30 text-green-300 text-sm px-4 py-4 font-body mb-6">
            Password updated successfully!
          </div>
          <p className="text-muted text-sm font-body">
            Redirecting you to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link href="/auth/login"
          className="text-[10px] tracking-widest uppercase text-muted hover:text-cream transition-colors font-body mb-10 block">
          &larr; Back to sign in
        </Link>

        <h1 className="font-display text-3xl font-light text-cream mb-2">
          Reset your password
        </h1>
        <p className="text-muted text-sm font-body leading-relaxed mb-8">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-900/30 border border-red-500/30 text-red-300 text-xs px-4 py-3 font-body">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[10px] tracking-widest uppercase text-muted mb-2 font-body">
              New Password
            </label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                required
                minLength={8}
                className={`${field} pr-12`}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-cream transition-colors"
              >
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] tracking-widest uppercase text-muted mb-2 font-body">
              Confirm Password
            </label>
            <input
              type="password"
              required
              className={field}
              placeholder="Repeat your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cream text-ink text-[10px] tracking-widest uppercase font-body font-medium py-4 hover:bg-stone transition-colors disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-cream border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}