"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import SectionHeader from "@/components/portal/ui/SectionHeader";
import Card from "@/components/portal/ui/Card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const TIMES = [
  "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM",
  "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM",
  "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM",
];

const SESSION_TYPES = [
  { value: "recurring",          label: "Recurring Session",    desc: "Your weekly training session" },
  { value: "initial_assessment", label: "Initial Assessment",   desc: "First session to build your plan" },
  { value: "makeup",             label: "Makeup Session",       desc: "Reschedule a missed session" },
];

export default function BookSessionPage() {
  const supabase = createClient();
  const router   = useRouter();

  const [client,      setClient]      = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [sessionType,  setSessionType]  = useState("recurring");
  const [notes,        setNotes]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [success,      setSuccess]      = useState(false);
  const [error,        setError]        = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("clients")
        .select("id, assigned_trainer_id, status, trainers:assigned_trainer_id(full_name)")
        .eq("user_id", user.id)
        .single();
      setClient(data);
    };
    load();
  }, []);

  // Calendar helpers
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year  = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const days  = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

 const handleSubmit = async () => {
  if (!selectedDate || !selectedTime || !client) return;

  setLoading(true);
  setError("");

  // Build datetime
  const [time, period] = selectedTime.split(" ");
  let [hour, min] = time.split(":").map(Number);
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  const dt = new Date(selectedDate);
  dt.setHours(hour, min, 0, 0);

  try {
    // ✅ Use supabase client - NOT fetch
    const { data, error } = await supabase
      .from("sessions")
      .insert({
        client_id: client.id,
        trainer_id: client.assigned_trainer_id,
        date_time: dt.toISOString(),
        session_type: sessionType,
        booking_status: "requested",
        location_notes: notes,
      })
      .select()
      .single();

    if (error) throw error;

    setSuccess(true);
  } catch (err: any) {
    console.error("Booking error:", err);
    setError(err.message ?? "Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};

  if (success) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <Card className="text-center py-16">
          <div className="w-12 h-12 bg-ink rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 10l4 4 8-8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="font-display text-2xl font-light text-ink mb-2">Session Requested</h2>
          <p className="text-muted text-sm font-body leading-relaxed mb-8 max-w-xs mx-auto">
            Your booking request has been sent to your trainer. You&apos;ll be notified once it&apos;s confirmed.
          </p>
          <button
            onClick={() => router.push("/dashboard/sessions")}
            className="bg-ink text-cream text-[10px] tracking-widest uppercase font-body px-8 py-3 hover:bg-accent transition-colors"
          >
            View My Sessions
          </button>
        </Card>
      </div>
    );
  }

  if (!client?.assigned_trainer_id) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <Card className="text-center py-16">
          <h2 className="font-display text-2xl font-light text-ink mb-2">No Trainer Assigned Yet</h2>
          <p className="text-muted text-sm font-body leading-relaxed max-w-xs mx-auto">
            Complete your onboarding to get matched with a trainer before booking sessions.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <SectionHeader
        title="Book a Session"
        subtitle={`Requesting a session with ${client?.trainers?.full_name ?? "your trainer"}`}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 font-body">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <p className="font-display text-lg font-light text-ink">
              {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentMonth(new Date(year, month - 1))}
                className="p-1.5 hover:bg-stone transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date(year, month + 1))}
                className="p-1.5 hover:bg-stone transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
              <div key={d} className="text-center text-[10px] tracking-widest uppercase text-muted font-body py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-px bg-stone">
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-cream aspect-square" />
            ))}
            {Array.from({ length: days }, (_, i) => i + 1).map(day => {
              const date = new Date(year, month, day);
              date.setHours(0, 0, 0, 0);
              const isPast     = date < today;
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              const isToday    = date.toDateString() === today.toDateString();

              return (
                <button
                  key={day}
                  disabled={isPast}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    "bg-cream aspect-square flex items-center justify-center text-sm font-body transition-colors",
                    isPast && "text-stone cursor-not-allowed",
                    !isPast && !isSelected && "hover:bg-stone text-ink",
                    isSelected && "bg-ink text-cream",
                    isToday && !isSelected && "font-medium underline"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {selectedDate && (
            <p className="text-xs text-muted font-body mt-3 text-center">
              {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          )}
        </Card>

        {/* Right side — time + options */}
        <div className="space-y-5">
          {/* Time picker */}
          <Card>
            <p className="text-[10px] tracking-widest uppercase text-muted mb-3 font-body">
              Select Time
            </p>
            <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
              {TIMES.map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedTime(t)}
                  className={cn(
                    "py-2 text-xs font-body transition-colors",
                    selectedTime === t
                      ? "bg-ink text-cream"
                      : "bg-stone text-ink hover:bg-warm"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </Card>

          {/* Session type */}
          <Card>
            <p className="text-[10px] tracking-widest uppercase text-muted mb-3 font-body">
              Session Type
            </p>
            <div className="space-y-2">
              {SESSION_TYPES.map(st => (
                <label key={st.value} className="flex items-start gap-3 cursor-pointer py-2">
                  <input
                    type="radio"
                    name="sessionType"
                    value={st.value}
                    checked={sessionType === st.value}
                    onChange={() => setSessionType(st.value)}
                    className="accent-ink w-3.5 h-3.5 mt-0.5"
                  />
                  <div>
                    <span className="text-sm text-ink font-body font-medium">{st.label}</span>
                    <p className="text-xs text-muted font-body">{st.desc}</p>
                    <p className="text-[10px] text-muted/70 font-body">Included in your plan</p>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          {/* Notes */}
          <Card>
            <p className="text-[10px] tracking-widest uppercase text-muted mb-3 font-body">
              Notes (optional)
            </p>
            <textarea
              rows={3}
              className="w-full border-b border-stone bg-transparent text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:border-ink transition-colors font-body resize-none"
              placeholder="Anything your trainer should know? (goals, injuries, preferences)"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </Card>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!selectedDate || !selectedTime || loading}
            className="w-full bg-ink text-cream text-[10px] tracking-widest uppercase font-body py-4 hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Book My Session"}
          </button>

          <p className="text-[10px] text-muted font-body text-center leading-relaxed">
            Your trainer will confirm your session shortly.
          </p>
        </div>
      </div>
    </div>
  );
}