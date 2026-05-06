"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Card from "@/components/portal/ui/Card";
import Badge from "@/components/portal/ui/Badge";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  clients: any[];
  trainers: any[];
}

function scoreMatch(client: any, trainer: any): number {
  let score = 0;
  const intake = client.client_intake;

  // Location 30%
  if (trainer.city && client.city &&
    trainer.city.toLowerCase() === client.city.toLowerCase()) score += 30;

  // Specialty 25%
  if (intake?.primary_goals && trainer.specialties) {
    const goals: string[]       = intake.primary_goals;
    const specialties: string[] = trainer.specialties;
    const overlap = goals.filter(g =>
      specialties.some(s => s.toLowerCase().includes(g.toLowerCase().split(" ")[0]))
    );
    score += Math.min(overlap.length * 8, 25);
  }

  // Availability 25%
  if (trainer.trainer_availability?.length > 0) score += 25;

  // Tier 10%
  if (trainer.tier === "elite_trainer")   score += 10;
  else if (trainer.tier === "senior_trainer") score += 6;
  else score += 3;

  // Capacity 10%
  const used = (trainer.current_client_count ?? 0) / (trainer.max_active_clients ?? 10);
  if (used < 0.5) score += 10;
  else if (used < 0.8) score += 5;

  return Math.round(score);
}

export default function MatchingEngine({ clients, trainers }: Props) {
  const supabase = createClient();
  const router   = useRouter();

  const [selected,  setSelected]  = useState<string | null>(clients[0]?.id ?? null);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [assigned,  setAssigned]  = useState<Set<string>>(new Set());
  const [expanded,  setExpanded]  = useState<string | null>(null);

  const selectedClient = clients.find(c => c.id === selected);

  const recommendations = trainers
    .map(t => ({ ...t, score: scoreMatch(selectedClient, t) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const handleAssign = async (trainerId: string) => {
  if (!selected) return;
  setAssigning(trainerId);

  const compatScore = recommendations.find(r => r.id === trainerId)?.score ?? 0;
  
  // ✅ Call your backend API instead of direct Supabase
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://formed-platform-production.up.railway.app";
  
  const response = await fetch(`${API_URL}/api/matching/assign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
    },
    body: JSON.stringify({
      client_id: selected,
      trainer_id: trainerId,
      compatibility_score: compatScore,
      notes: null,
    }),
  });

  if (response.ok) {
    setAssigned(prev => new Set([...prev, selected]));
    router.refresh();
  }
  
  setAssigning(null);
};

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Client queue */}
      <div>
        <p className="text-[10px] tracking-widest uppercase text-muted mb-3 font-body">
          Clients Awaiting Match
        </p>
        <div className="space-y-2">
          {clients.map((c) => (
            <button key={c.id}
              onClick={() => setSelected(c.id)}
              className={cn(
                "w-full text-left border p-4 transition-all",
                selected === c.id
                  ? "border-ink bg-white"
                  : "border-stone bg-white hover:border-warm",
                assigned.has(c.id) && "opacity-50"
              )}>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-body font-medium text-ink">{c.full_name}</p>
                  <p className="text-xs text-muted font-body">{c.city} · {c.plan_type?.replace("_", " ")}</p>
                </div>
                {assigned.has(c.id) && <Check size={14} className="text-green-500" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="lg:col-span-2">
        {selectedClient ? (
          <>
            <div className="mb-4 p-4 bg-ink text-cream">
              <p className="text-[10px] tracking-widest uppercase text-warm/40 mb-1 font-body">
                Matching for
              </p>
              <p className="font-display text-xl font-light">{selectedClient.full_name}</p>
              <p className="text-cream/60 text-xs font-body">
                {selectedClient.city} · {selectedClient.plan_type?.replace("_", " ")} ·{" "}
                {selectedClient.client_intake?.primary_goals?.join(", ")}
              </p>
            </div>

            <p className="text-[10px] tracking-widest uppercase text-muted mb-3 font-body">
              Top Recommendations
            </p>

            <div className="space-y-3">
              {recommendations.map((trainer, i) => (
                <Card key={trainer.id}
                  className={i === 0 ? "border-l-2 border-l-ink" : ""}>
                  {/* Score bar */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {i === 0 && (
                          <span className="text-[9px] tracking-widest uppercase font-body bg-ink text-cream px-2 py-0.5">
                            Best match
                          </span>
                        )}
                      </div>
                      <p className="font-body font-medium text-ink text-sm">{trainer.full_name}</p>
                      <p className="text-muted text-xs font-body">
                        {trainer.city} · {trainer.tier?.replace(/_/g, " ")} ·{" "}
                        {trainer.current_client_count}/{trainer.max_active_clients} clients
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-display text-3xl font-light text-ink">{trainer.score}</p>
                      <p className="text-[10px] text-muted font-body">/ 100</p>
                    </div>
                  </div>

                  {/* Score bar */}
                  <div className="h-1 bg-stone mb-3">
                    <div
                      className="h-1 bg-ink transition-all"
                      style={{ width: `${trainer.score}%` }}
                    />
                  </div>

                  {/* Specialty tags */}
                  {trainer.specialties?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {trainer.specialties.slice(0, 4).map((s: string) => (
                        <span key={s} className="text-[10px] bg-stone text-muted px-2 py-0.5 font-body">{s}</span>
                      ))}
                    </div>
                  )}

                  {/* Expand breakdown */}
                  <button
                    onClick={() => setExpanded(expanded === trainer.id ? null : trainer.id)}
                    className="flex items-center gap-1 text-[10px] tracking-widest uppercase text-muted font-body mb-3 hover:text-ink transition-colors">
                    Score breakdown
                    {expanded === trainer.id ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                  </button>

                  {expanded === trainer.id && (
                    <div className="grid grid-cols-2 gap-2 mb-3 p-3 bg-cream">
                      {[
                        { label: "Location match",   pts: trainer.city === selectedClient.city ? 30 : 0,  max: 30 },
                        { label: "Specialty match",  pts: Math.min((selectedClient.client_intake?.primary_goals?.length ?? 0) * 8, 25), max: 25 },
                        { label: "Availability",     pts: trainer.trainer_availability?.length > 0 ? 25 : 0, max: 25 },
                        { label: "Tier / rating",    pts: trainer.tier === "elite_trainer" ? 10 : trainer.tier === "senior_trainer" ? 6 : 3, max: 10 },
                        { label: "Capacity",         pts: ((trainer.current_client_count ?? 0) / (trainer.max_active_clients ?? 10)) < 0.5 ? 10 : 5, max: 10 },
                      ].map(item => (
                        <div key={item.label} className="flex items-center justify-between gap-2">
                          <p className="text-[10px] text-muted font-body">{item.label}</p>
                          <p className="text-[10px] font-body text-ink font-medium">{item.pts}/{item.max}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => handleAssign(trainer.id)}
                    disabled={assigning === trainer.id || assigned.has(selectedClient?.id)}
                    className="w-full bg-ink text-cream text-[10px] tracking-widest uppercase font-body py-3 hover:bg-accent transition-colors disabled:opacity-40">
                    {assigning === trainer.id ? "Assigning..." :
                     assigned.has(selectedClient?.id) ? "Already Assigned" :
                     "Assign This Trainer"}
                  </button>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <Card>
            <p className="text-center text-muted text-sm font-body py-8">
              Select a client to see trainer recommendations.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}