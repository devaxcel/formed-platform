"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, User, Dumbbell, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Tab config ────────────────────────────────────────────────────────────────

const TABS = [
  {
    key:      "client",
    label:    "Client",
    icon:     User,
    heading:  "Client Portal",
    tagline:  "Track your sessions, progress, and billing.",
    apply:    { label: "Apply for membership", href: "https://formed.fit/apply" },
    redirect: "/dashboard",
  },
  {
    key:      "trainer",
    label:    "Trainer",
    icon:     Dumbbell,
    heading:  "Trainer Portal",
    tagline:  "Manage your clients, sessions, and schedule.",
    apply:    { label: "Apply to join FORMED", href: "https://formed.fit/trainers/apply" },
    redirect: "/trainer",
  },
  {
    key:      "admin",
    label:    "Admin",
    icon:     ShieldCheck,
    heading:  "Admin Portal",
    tagline:  "Manage the full FORMED platform.",
    apply:    null,
    redirect: "/admin",
  },
] as const;

type TabKey = "client" | "trainer" | "admin";

// ── Component ─────────────────────────────────────────────────────────────────

export default function TabbedLoginForm() {
  const router   = useRouter();
  const supabase = createClient();

  const [tab,      setTab]      = useState<TabKey>("client");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [show,     setShow]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const activeTab = TABS.find(t => t.key === tab)!;

  // Role → expected redirect map for validation
  const ROLE_REDIRECT: Record<string, string> = {
    admin:   "/admin",
    trainer: "/trainer",
    client:  "/dashboard",
  };

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

    // Warn if logging in on wrong tab
    if (role !== tab) {
      setError(
        `This account is registered as a ${role}. Redirecting you to the correct portal.`
      );
      setTimeout(() => {
        router.push(ROLE_REDIRECT[role] ?? "/dashboard");
      }, 2000);
      setLoading(false);
      return;
    }

    router.push(activeTab.redirect);
  };

  // Reset form when switching tabs
  const switchTab = (key: TabKey) => {
    setTab(key);
    setError("");
    setEmail("");
    setPassword("");
  };

  const field = "w-full bg-cream/5 border border-cream/20 text-cream placeholder:text-muted text-sm px-4 py-3 focus:outline-none focus:border-cream/50 transition-colors font-body";
  const label = "block text-[10px] tracking-widest uppercase text-muted mb-2 font-body";

  return (
    <div>
      {/* Tabs */}
      <div className="flex border border-cream/10 mb-8">
        {TABS.map(t => {
          const Icon    = t.icon;
          const active  = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => switchTab(t.key as TabKey)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1.5 py-4 px-3 transition-all text-center",
                active
                  ? "bg-cream/10 border-b-2 border-warm"
                  : "hover:bg-cream/5 border-b-2 border-transparent"
              )}
            >
              <Icon
                size={16}
                className={active ? "text-warm" : "text-muted"}
              />
              <span className={cn(
                "text-[10px] tracking-widest uppercase font-body",
                active ? "text-cream" : "text-muted"
              )}>
                {t.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Heading — changes per tab */}
      <div className="mb-8">
        <p className="text-[10px] tracking-widests uppercase text-muted mb-2 font-body">
          {activeTab.heading}
        </p>
        <h1 className="font-display text-4xl font-light text-cream mb-1">
          Sign in
        </h1>
        <p className="text-cream/40 text-sm font-body">
          {activeTab.tagline}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-900/30 border border-red-500/30 text-red-300 text-xs px-4 py-3 font-body leading-relaxed">
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
          <a
            href="/auth/forgot-password"
            className="text-xs text-muted hover:text-cream transition-colors font-body"
          >
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-cream text-ink text-[10px] tracking-widests uppercase font-body font-medium py-4 hover:bg-stone transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in..." : `Sign in as ${activeTab.label}`}
        </button>
      </form>

      {/* Apply link — only for client and trainer tabs */}
      {activeTab.apply && (
        <p className="mt-8 text-center text-xs text-muted font-body">
          Not a member?{" "}
          <a
            href={activeTab.apply.href}
            className="text-warm hover:text-cream transition-colors"
          >
            {activeTab.apply.label}
          </a>
        </p>
      )}
    </div>
  );
}
