"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import SectionHeader from "@/components/portal/ui/SectionHeader";
import Card from "@/components/portal/ui/Card";
import { cn } from "@/lib/utils";

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const BLOCKS = ["morning","midday","evening"] as const;
const BLOCK_LABELS = { morning: "Morning (6am–12pm)", midday: "Midday (12–5pm)", evening: "Evening (5–9pm)" };

export default function AvailabilityPage() {
  const supabase = createClient();
  const [trainerId, setTrainerId]   = useState<string | null>(null);
  const [availability, setAvailability] = useState<Record<string, Set<string>>>({});
  const [maxPerDay,    setMaxPerDay] = useState(4);
  const [zone,         setZone]      = useState("");
  const [loading,      setLoading]   = useState(true);
  const [saving,       setSaving]    = useState(false);
  const [saved,        setSaved]     = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: trainer } = await supabase
        .from("trainers").select("id, areas_served").eq("user_id", user.id).single();

      if (!trainer) return;
      setTrainerId(trainer.id);
      setZone(trainer.areas_served?.[0] ?? "");

      const { data: avail } = await supabase
        .from("trainer_availability")
        .select("*")
        .eq("trainer_id", trainer.id)
        .eq("is_active", true);

      const map: Record<string, Set<string>> = {};
      DAYS.forEach((_, i) => { map[i] = new Set(); });
      avail?.forEach(a => { map[a.day_of_week]?.add(a.time_block); });
      setAvailability(map);
      setMaxPerDay(avail?.[0]?.max_sessions_per_day ?? 4);
      setLoading(false);
    };
    load();
  }, []);

  const toggle = (day: number, block: string) => {
  setAvailability(prev => {
    // Ensure prev[day] exists and is a Set
    const currentSet = prev[day] || new Set<string>();
    const nextSet = new Set(currentSet);
    
    if (nextSet.has(block)) {
      nextSet.delete(block);
    } else {
      nextSet.add(block);
    }
    
    return { ...prev, [day]: nextSet };
  });
};

  const handleSave = async () => {
    if (!trainerId) return;
    setSaving(true);

    // Delete existing
    await supabase.from("trainer_availability")
      .delete().eq("trainer_id", trainerId);

    // Insert new
    const rows: any[] = [];
    Object.entries(availability).forEach(([day, blocks]) => {
      blocks.forEach(block => {
        const times = {
          morning: { start: "06:00", end: "12:00" },
          midday:  { start: "12:00", end: "17:00" },
          evening: { start: "17:00", end: "21:00" },
        }[block] ?? { start: "09:00", end: "17:00" };

        rows.push({
          trainer_id:          trainerId,
          day_of_week:         parseInt(day),
          time_block:          block,
          start_time:          times.start,
          end_time:            times.end,
          zone,
          max_sessions_per_day: maxPerDay,
          is_active:           true,
        });
      });
    });

    if (rows.length > 0) {
      await supabase.from("trainer_availability").insert(rows);
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="w-6 h-6 border-2 border-ink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <SectionHeader
        title="Availability"
        subtitle="Set your weekly available time blocks"
      />

      <Card>
        <p className="text-[10px] tracking-widest uppercase text-muted mb-4 font-body">
          Weekly Schedule
        </p>
        <div className="space-y-3">
          {DAYS.map((day, i) => (
            <div key={day} className="grid grid-cols-4 gap-2 items-center">
              <p className="text-xs font-body text-ink font-medium">{day.slice(0, 3)}</p>
              {BLOCKS.map(block => (
                <button key={block}
                  type="button"
                  onClick={() => toggle(i, block)}
                  className={cn(
                    "py-2 text-[10px] tracking-widest uppercase font-body transition-colors",
                    availability[i]?.has(block)
                      ? "bg-ink text-cream"
                      : "bg-stone text-muted hover:bg-warm"
                  )}
                >
                  {block}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-stone grid grid-cols-2 gap-5">
          <div>
            <label className="block text-[10px] tracking-widest uppercase text-muted mb-2 font-body">
              Max Sessions / Day
            </label>
            <select
              value={maxPerDay}
              onChange={e => setMaxPerDay(Number(e.target.value))}
              className="w-full border-b border-stone bg-transparent py-2 text-sm text-ink focus:outline-none focus:border-ink font-body"
            >
              {[1,2,3,4,5,6].map(n => (
                <option key={n} value={n}>{n} session{n > 1 ? "s" : ""}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] tracking-widest uppercase text-muted mb-2 font-body">
              Primary Service Zone
            </label>
            <input
              className="w-full border-b border-stone bg-transparent py-2 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:border-ink font-body"
              placeholder="e.g. South Tampa"
              value={zone}
              onChange={e => setZone(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-ink text-cream text-[10px] tracking-widest uppercase font-body px-8 py-3 hover:bg-accent transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Availability"}
          </button>
          {saved && (
            <p className="text-green-600 text-xs font-body">Saved successfully.</p>
          )}
        </div>
      </Card>

      <div className="bg-stone p-4">
        <p className="text-xs text-muted font-body leading-relaxed">
          Your availability can be locked or overridden by the admin team for client continuity.
          Contact support if you need a change that conflicts with an existing client schedule.
        </p>
      </div>
    </div>
  );
}