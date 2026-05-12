"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, UserCheck, GitMerge,
  Calendar, ClipboardList, ShieldCheck, CreditCard,
  DollarSign, MessageSquare, BarChart2, Settings,
  Bell, LogOut, Menu, X, Layers
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn, getInitials } from "@/lib/utils";

const navGroups = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard",      href: "/admin",                   icon: LayoutDashboard },
    ],
  },
  {
    label: "People",
    items: [
      { label: "Client Applications", href: "/admin/applications/clients",  icon: Users },
      { label: "Trainer Applications",href: "/admin/applications/trainers", icon: UserCheck },
      { label: "Active Clients",      href: "/admin/clients",              icon: Users },
      { label: "Active Trainers",     href: "/admin/trainers",             icon: UserCheck },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Matching Center",  href: "/admin/matching",    icon: GitMerge },
      { label: "Calendar",         href: "/admin/calendar",    icon: Calendar },
      { label: "Sessions",         href: "/admin/sessions",    icon: ClipboardList },
      { label: "Compliance",       href: "/admin/compliance",  icon: ShieldCheck },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Billing",          href: "/admin/billing",     icon: CreditCard },
      { label: "Payouts",          href: "/admin/payouts",     icon: DollarSign },
    ],
  },
  {
    label: "Support",
    items: [
      { label: "Support Tickets",  href: "/admin/tickets",     icon: MessageSquare },
      { label: "Notifications",    href: "/admin/notifications",icon: Bell },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Reporting",        href: "/admin/reporting",   icon: BarChart2 },
      { label: "Onboarding Mgr",   href: "/admin/content",     icon: Layers },
      { label: "Settings",         href: "/admin/settings",    icon: Settings },
    ],
  },
];

interface AdminSidebarProps {
  userEmail: string;
  adminRole: string;
}

export default function AdminSidebar({ userEmail, adminRole }: AdminSidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const initials = getInitials(userEmail);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-ink overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-cream/10 flex-shrink-0">
        <p className="font-display text-cream text-lg font-light tracking-wide">FORMED</p>
        <p className="text-[10px] tracking-widest uppercase text-muted font-body mt-0.5">
          Admin Dashboard
        </p>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 px-2 py-4 space-y-5 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-[9px] tracking-widest uppercase text-muted/60 font-body px-3 mb-1.5">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ label, href, icon: Icon }) => {
                const active = pathname === href ||
                  (href !== "/admin" && pathname.startsWith(href));
                return (
                  <Link key={href} href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 text-[11px] tracking-wide font-body transition-all duration-150 group",
                      active
                        ? "bg-cream/10 text-cream"
                        : "text-muted hover:text-cream hover:bg-cream/5"
                    )}
                  >
                    <Icon size={13} className={cn(
                      "flex-shrink-0",
                      active ? "text-cream" : "text-muted group-hover:text-cream"
                    )} />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-2 py-3 border-t border-cream/10 flex-shrink-0">
        <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-warm/20 flex items-center justify-center flex-shrink-0">
            <span className="text-cream text-[9px] font-body">{initials}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-cream text-[11px] font-body truncate">{userEmail}</p>
            <p className="text-muted text-[9px] font-body capitalize">
              {adminRole.replace(/_/g, " ")}
            </p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 text-[11px] text-muted hover:text-cream font-body transition-colors w-full">
          <LogOut size={12} /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:flex flex-col w-52 flex-shrink-0">
        <SidebarContent />
      </div>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-ink text-cream p-2"
      >
        <Menu size={18} />
      </button>
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-60 flex-shrink-0"><SidebarContent /></div>
          <div className="flex-1 bg-ink/50" onClick={() => setOpen(false)}>
            <button className="absolute top-4 right-4 text-cream"><X size={20} /></button>
          </div>
        </div>
      )}
    </>
  );
}