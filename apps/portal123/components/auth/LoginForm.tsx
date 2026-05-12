"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  const router   = useRouter();
  const supabase = createClient();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [show,     setShow]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !data.user) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
      return;
    }

    // Fetch role from users table
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", data.user.id)
      .single();

    const role = profile?.role ?? "client";

    // Redirect based on role
    if (role === "admin")   { router.push("/admin");     return; }
    if (role === "trainer") { router.push("/trainer");   return; }
    router.push("/dashboard");
  };

  const field = "w-full bg-cream/5 border border-cream/20 text-cream placeholder:text-muted text-sm px-4 py-3 focus:outline-none focus:border-cream/50 transition-colors font-body";
  const label = "block text-[10px] tracking-widest uppercase text-muted mb-2 font-body";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-900/30 border border-red-500/30 text-red-300 text-xs px-4 py-3 font-body">
          {error}
        </div>
      )}

      <div>
        <label className={label}>Email</label>
        <input
          type="email"
          required
          className={field}
          placeholder="you@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label className={label}>Password</label>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            required
            className={`${field} pr-12`}
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
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

      <div className="flex justify-end">
        
         <a href="/auth/forgot-password"
          className="text-xs text-muted hover:text-cream transition-colors font-body"
        >
          Forgot password?
        </a>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-cream text-ink text-[10px] tracking-widest uppercase font-body font-medium py-4 hover:bg-stone transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}