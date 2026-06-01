"use client";

import { useState, useEffect } from "react";
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
    // Unsplash — person training with personal trainer
    image:    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80&fit=crop",
    welcome:  "Welcome back.",
    sub:      "Pick up where you left off. Your trainer, your sessions, and your progress — all in one place.",
    apply:    { label: "Apply for membership", href: "https://formed.fit/apply" },
    redirect: "/dashboard",
  },
  {
    key:      "trainer",
    label:    "Trainer",
    icon:     Dumbbell,
    heading:  "Trainer Portal",
    tagline:  "Manage your clients, sessions, and schedule.",
    // Unsplash — trainer coaching client
    image:    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80&fit=crop",
    welcome:  "Ready to coach.",
    sub:      "Your clients are waiting. Manage sessions, track progress, and grow your practice.",
    apply:    { label: "Apply to join FORMED", href: "https://formed.fit/trainers/apply" },
    redirect: "/trainer",
  },
  {
    key:      "admin",
    label:    "Admin",
    icon:     ShieldCheck,
    heading:  "Admin Portal",
    tagline:  "Manage the full FORMED platform.",
    // Unsplash — clean gym interior
    image:    "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1200&q=80&fit=crop",
    welcome:  "Platform control.",
    sub:      "Oversee clients, trainers, billing, and operations from one central dashboard.",
    apply:    null,
    redirect: "/admin",
  },
] as const;

type TabKey = "client" | "trainer" | "admin";

const ROLE_REDIRECT: Record<string, string> = {
  admin:   "/admin",
  trainer: "/trainer",
  client:  "/dashboard",
};

// ── Main Component ────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router   = useRouter();
  const supabase = createClient();

  const [tab,      setTab]      = useState<TabKey>("client");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [show,     setShow]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const activeTab = TABS.find(t => t.key === tab)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError || !data.user) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("users").select("role").eq("id", data.user.id).single();

    const role = profile?.role ?? "client";

    if (role !== tab) {
      setError(`This account is registered as a ${role}. Redirecting you now...`);
      setTimeout(() => router.push(ROLE_REDIRECT[role] ?? "/dashboard"), 2000);
      setLoading(false);
      return;
    }

    router.push(activeTab.redirect);
  };

  // Read hash OR pathname to set tab
  // /auth/login#trainer OR /trainer/login OR /client/login OR /admin/login
  useEffect(() => {
    const hash     = window.location.hash.replace("#", "");
    const pathname = window.location.pathname;

    if (pathname.startsWith("/trainer/login")) {
      setTab("trainer");
      window.history.replaceState(null, "", "/trainer/login");
    } else if (pathname.startsWith("/admin/login")) {
      setTab("admin");
      window.history.replaceState(null, "", "/admin/login");
    } else if (pathname.startsWith("/client/login")) {
      setTab("client");
      window.history.replaceState(null, "", "/client/login");
    } else if (["client", "trainer", "admin"].includes(hash)) {
      setTab(hash as TabKey);
    }
  }, []);

  const switchTab = (key: TabKey) => {
    setTab(key);
    setError("");
    setEmail("");
    setPassword("");
    // Update URL to role-specific path
    const paths: Record<TabKey, string> = {
      client:  "/client/login",
      trainer: "/trainer/login",
      admin:   "/admin/login",
    };
    window.history.replaceState(null, "", paths[key]);
  };

  const field = "w-full bg-cream/5 border border-cream/20 text-cream placeholder:text-muted text-sm px-4 py-3 focus:outline-none focus:border-cream/50 transition-colors font-body";
  const labelCls = "block text-[10px] tracking-widest uppercase text-muted mb-2 font-body";

  return (
    <div className="min-h-screen bg-ink flex">

      {/* ── Left panel — changes per tab ─────────────────────────────── */}
      <div className="hidden lg:block relative w-1/2 overflow-hidden">

        {/* Background images — all stacked, only active one is visible */}
        {TABS.map(t => (
          <div
            key={t.key}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              tab === t.key ? "opacity-100" : "opacity-0"
            )}
          >
            <img
              src={t.image}
              alt=""
              className="w-full h-full object-cover"
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-ink/70" />
          </div>
        ))}

        {/* Content on top of image */}
        <div className="relative z-10 flex flex-col justify-between h-full p-14">

          {/* Logo */}
          <a href="https://www.formed.fit" target="_blank" rel="noopener noreferrer">
            <img
              src="/images/Logo-dark.png"
              alt="FORMED Logo"
              className="h-8 w-auto object-contain"
            />
          </a>

          {/* Dynamic text — fades per tab */}
          <div>
            {TABS.map(t => (
              <div
                key={t.key}
                className={cn(
                  "absolute transition-all duration-500",
                  tab === t.key
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4 pointer-events-none"
                )}
              >
                {/* Tab indicator */}
                <div className="flex items-center gap-2 mb-6">
                  <t.icon size={14} className="text-warm" />
                  <p className="text-[10px] tracking-widest uppercase text-warm font-body">
                    {t.heading}
                  </p>
                </div>
                <p className="font-display text-5xl font-light text-cream leading-tight mb-4">
                  {t.welcome}
                </p>
                <p className="text-cream/50 text-sm font-body leading-relaxed max-w-xs">
                  {t.sub}
                </p>
              </div>
            ))}
            {/* Spacer so the absolute positioned text has room */}
            <div className="h-48" />
          </div>

          <p className="text-muted text-xs font-body tracking-widest uppercase">
            Tampa Bay · Private Training
          </p>
        </div>
      </div>

      {/* ── Right panel — form ────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden mb-10">
            <p className="font-display text-cream text-2xl font-light">FORMED</p>
          </div>

          {/* Tabs */}
          <div className="flex border border-cream/10 mb-8">
            {TABS.map(t => {
              const Icon   = t.icon;
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => switchTab(t.key as TabKey)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-1.5 py-4 px-3 transition-all",
                    active
                      ? "bg-cream/10 border-b-2 border-warm"
                      : "hover:bg-cream/5 border-b-2 border-transparent"
                  )}
                >
                  <Icon size={16} className={active ? "text-warm" : "text-muted"} />
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

          {/* Heading */}
          <div className="mb-8">
            <p className="text-[10px] tracking-widest uppercase text-muted mb-2 font-body">
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
              <label className={labelCls}>Email</label>
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
              <label className={labelCls}>Password</label>
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

          {/* Apply link */}
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
      </div>
    </div>
  );
}
