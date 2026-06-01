"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Calendar, Clock, TrendingUp,
  CreditCard, MessageSquare, User, LogOut, Menu, X
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn, getInitials } from "@/lib/utils";

const nav = [
  { label: "Dashboard",       href: "/dashboard",          icon: LayoutDashboard },
  { label: "Book Session",    href: "/dashboard/book",     icon: Calendar },
  { label: "My Sessions",     href: "/dashboard/sessions", icon: Clock },
  { label: "Progress",        href: "/dashboard/progress", icon: TrendingUp },
  { label: "Billing",         href: "/dashboard/billing",  icon: CreditCard },
  { label: "Support",         href: "/dashboard/support",  icon: MessageSquare },
  { label: "Profile",         href: "/dashboard/profile",  icon: User },
];

interface SidebarProps {
  profile: any;
  userEmail: string;
}

export default function Sidebar({ profile, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const name     = profile?.full_name ?? userEmail;
  const initials = getInitials(name);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-ink">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-cream/10">
        <p className="font-display text-cream text-lg font-light tracking-wide">FORMED</p>
        <p className="text-[10px] tracking-widest uppercase text-muted font-body mt-0.5">
          Client Portal
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-0.5 overflow-y-auto">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-xs tracking-wide font-body transition-all duration-150 group",
                active
                  ? "bg-cream/10 text-cream"
                  : "text-muted hover:text-cream hover:bg-cream/5"
              )}
            >
              <Icon size={15} className={cn("flex-shrink-0 transition-colors", active ? "text-cream" : "text-muted group-hover:text-cream")} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-cream/10">
        {/* Trainer card if matched */}
        {profile?.trainers && (
          <div className="mb-4 px-3 py-3 bg-cream/5 border border-cream/10">
            <p className="text-[10px] tracking-widest uppercase text-muted mb-1.5 font-body">
              Your Trainer
            </p>
            <p className="text-cream text-xs font-body font-medium">
              {profile.trainers.full_name}
            </p>
          </div>
        )}

        {/* User row */}
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-warm/30 flex items-center justify-center flex-shrink-0">
            <span className="text-cream text-[10px] font-medium font-body">{initials}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-cream text-xs font-body truncate">{name}</p>
            <p className="text-muted text-[10px] font-body truncate">{userEmail}</p>
          </div>
        </div>

        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 text-xs text-muted hover:text-cream font-body transition-colors w-full">
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:flex flex-col w-56 flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-ink text-cream p-2"
      >
        <Menu size={18} />
      </button>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 flex-shrink-0">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-ink/50" onClick={() => setOpen(false)}>
            <button className="absolute top-4 right-4 text-cream">
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}