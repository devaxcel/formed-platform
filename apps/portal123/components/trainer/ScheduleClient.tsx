"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Card from "@/components/portal/ui/Card";
import SectionHeader from "@/components/portal/ui/SectionHeader";
import EmptyState from "@/components/portal/ui/EmptyState";
import { Calendar, Check, X, FileText } from "lucide-react";
import { formatDate, formatTime, cn } from "@/lib/utils";
import Link from "next/link";

interface Props {
  sessions: any[];
  accessToken: string;
}

type Filter = "all" | "today" | "requested" | "upcoming" | "completed";

function SimpleStatus({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    requested:        { label: "Pending",    cls: "bg-yellow-100 text-yellow-700" },
    trainer_accepted: { label: "Pending",    cls: "bg-yellow-100 text-yellow-700" },
    admin_confirmed:  { label: "Confirmed",  cls: "bg-green-100 text-green-700" },
    paid:             { label: "Confirmed",  cls: "bg-green-100 text-green-700" },
    completed:        { label: "Completed",  cls: "bg-stone text-muted" },
    cancelled:        { label: "Cancelled",  cls: "bg-red-50 text-red-500" },
    no_show:          { label: "No Show",    cls: "bg-red-100 text-red-700" },
    payment_pending:  { label: "Pending Payment", cls: "bg-orange-100 text-orange-700" },
  };
  const entry = map[status] ?? { label: status.replace(/_/g, " "), cls: "bg-stone text-muted" };
  return (
    <span className={`text-[10px] tracking-widest uppercase font-body px-2.5 py-1 ${entry.cls}`}>
      {entry.label}
    </span>
  );
}

function groupByDay(sessions: any[]) {
  const now = new Date();
  const todayStr = now.toDateString();
  const tomorrowStr = new Date(now.getTime() + 86400000).toDateString();
  const weekEnd = new Date(now.getTime() + 7 * 86400000);

  const today: any[]     = [];
  const tomorrow: any[]  = [];
  const thisWeek: any[]  = [];
  const later: any[]     = [];

  sessions.forEach(s => {
    const d = new Date(s.date_time);
    const dStr = d.toDateString();
    if (dStr === todayStr)         today.push(s);
    else if (dStr === tomorrowStr) tomorrow.push(s);
    else if (d <= weekEnd)         thisWeek.push(s);
    else                           later.push(s);
  });

  return { today, tomorrow, thisWeek, later };
}

export default function ScheduleClient({ sessions: initial }: Props) {
  const supabase = createClient();
  const [sessions, setSessions] = useState(initial);
  const [loading,  setLoading]  = useState<string | null>(null);
  const [filter,   setFilter]   = useState<Filter>("all");

  const updateStatus = async (id: string, status: string) => {
    setLoading(id);
    await supabase.from("sessions").update({ booking_status: status }).eq("id", id);
    setSessions(prev => prev.map(s => s.id === id ? { ...s, booking_status: status } : s));
    setLoading(null);
  };

  const filters = [
    { key: "all",       label: "All" },
    { key: "today",     label: "Today" },
    { key: "requested", label: "Pending" },
    { key: "upcoming",  label: "Confirmed" },
    { key: "completed", label: "Completed" },
  ] as const;

  const now = new Date();
  const todayStr     = now.toDateString();
  const tomorrowStr  = new Date(now.getTime() + 86400000).toDateString();

  const filtered = sessions.filter(s => {
    const dStr = new Date(s.date_time).toDateString();
    if (filter === "all")       return true;
    if (filter === "today")     return dStr === todayStr;
    if (filter === "requested") return s.booking_status === "requested";
    if (filter === "upcoming")  return (
      ["admin_confirmed","trainer_accepted","paid"].includes(s.booking_status) &&
      new Date(s.date_time) > now
    );
    if (filter === "completed") return s.booking_status === "completed";
    return true;
  });

  const pending = sessions.filter(s => s.booking_status === "requested");

  // Group for "all" view
  const groups = filter === "all" ? groupByDay(sessions) : null;

  const renderSession = (s: any) => {
    const isPending = s.booking_status === "requested";
    const isCompleted = s.booking_status === "completed";
    const needsNotes = isCompleted && !s.notes_submitted;
    const dStr = new Date(s.date_time).toDateString();

    return (
      <Card key={s.id} className={cn(isPending ? "border-l-2 border-l-yellow-400" : "")}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="bg-cream w-12 h-12 flex flex-col items-center justify-center border border-stone flex-shrink-0">
              <span className="text-[9px] font-body text-muted uppercase">
                {new Date(s.date_time).toLocaleDateString("en-US", { month: "short" })}
              </span>
              <span className="font-display text-xl font-light text-ink leading-none">
                {new Date(s.date_time).getDate()}
              </span>
            </div>
            <div>
              <p className="font-body font-medium text-ink text-sm">
                {s.clients?.full_name}
              </p>
              <p className="text-muted text-xs font-body">
                {formatTime(s.date_time)}
                {s.duration_minutes && ` · ${s.duration_minutes} min`}
                {s.session_type && ` · ${s.session_type.replace(/_/g, " ")}`}
              </p>
              {s.location_notes && (
                <p className="text-muted text-xs font-body mt-0.5 italic">
                  {s.location_notes}
                </p>
              )}
              {/* Notes indicator */}
              {needsNotes && (
                <p className="text-[10px] text-amber-600 font-body mt-1">
                  Notes required
                </p>
              )}
              {isCompleted && s.notes_submitted && (
                <p className="text-[10px] text-green-600 font-body mt-1">
                  Notes submitted
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <SimpleStatus status={s.booking_status} />

            {/* Action buttons */}
            <div className="flex flex-wrap gap-1.5 justify-end">
              {/* Pending: Accept / Decline */}
              {isPending && (
                <>
                  <button
                    onClick={() => updateStatus(s.id, "trainer_accepted")}
                    disabled={loading === s.id}
                    className="flex items-center gap-1 text-[10px] tracking-widest uppercase font-body bg-ink text-cream px-3 py-1.5 hover:bg-accent transition-colors disabled:opacity-50"
                  >
                    <Check size={10} /> Accept
                  </button>
                  <button
                    onClick={() => updateStatus(s.id, "cancelled")}
                    disabled={loading === s.id}
                    className="flex items-center gap-1 text-[10px] tracking-widest uppercase font-body bg-stone text-muted px-3 py-1.5 hover:bg-warm transition-colors disabled:opacity-50"
                  >
                    <X size={10} /> Decline
                  </button>
                </>
              )}

              {/* Add Notes */}
              {needsNotes && (
                <Link
                  href={`/trainer/notes/${s.id}`}
                  className="flex items-center gap-1 text-[10px] tracking-widest uppercase font-body bg-amber-500 text-white px-3 py-1.5 hover:bg-amber-600 transition-colors"
                >
                  <FileText size={10} /> Add Notes
                </Link>
              )}

              {/* Reschedule */}
              {!isCompleted && s.booking_status !== "cancelled" && !isPending && (
                <Link
                  href="/trainer/messages"
                  className="text-[10px] tracking-widests uppercase font-body text-muted hover:text-ink transition-colors border border-stone px-2.5 py-1.5"
                >
                  Reschedule
                </Link>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <SectionHeader
        title="My Schedule"
        subtitle="Manage booking requests and upcoming sessions"
      />

      {/* Filter tabs */}
      <div className="flex gap-0 border-b border-stone overflow-x-auto">
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={cn(
              "px-4 py-2.5 text-[10px] tracking-widest uppercase font-body transition-colors border-b-2 -mb-px whitespace-nowrap",
              filter === f.key
                ? "border-ink text-ink"
                : "border-transparent text-muted hover:text-ink"
            )}
          >
            {f.label}
            {f.key === "requested" && pending.length > 0 && (
              <span className="ml-1.5 bg-yellow-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                {pending.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grouped view for "all" */}
      {filter === "all" && groups ? (
        <div className="space-y-8">
          {groups.today.length > 0 && (
            <div>
              <p className="text-[10px] tracking-widests uppercase text-muted mb-3 font-body flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" /> Today
              </p>
              <div className="space-y-3">{groups.today.map(renderSession)}</div>
            </div>
          )}
          {groups.tomorrow.length > 0 && (
            <div>
              <p className="text-[10px] tracking-widests uppercase text-muted mb-3 font-body">
                Tomorrow
              </p>
              <div className="space-y-3">{groups.tomorrow.map(renderSession)}</div>
            </div>
          )}
          {groups.thisWeek.length > 0 && (
            <div>
              <p className="text-[10px] tracking-widests uppercase text-muted mb-3 font-body">
                This Week
              </p>
              <div className="space-y-3">{groups.thisWeek.map(renderSession)}</div>
            </div>
          )}
          {groups.later.length > 0 && (
            <div>
              <p className="text-[10px] tracking-widests uppercase text-muted mb-3 font-body">
                Upcoming
              </p>
              <div className="space-y-3">{groups.later.map(renderSession)}</div>
            </div>
          )}
          {sessions.length === 0 && (
            <Card>
              <EmptyState icon={<Calendar size={28} />} title="No sessions yet"
                description="Sessions will appear here once bookings are confirmed." />
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.length > 0
            ? filtered.map(renderSession)
            : (
              <Card>
                <EmptyState icon={<Calendar size={28} />}
                  title="No sessions found"
                  description="No sessions match this filter." />
              </Card>
            )
          }
        </div>
      )}
    </div>
  );
}