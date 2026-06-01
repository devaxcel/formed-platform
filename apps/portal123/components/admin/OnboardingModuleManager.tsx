"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Card from "@/components/portal/ui/Card";
import { Plus, Trash2 } from "lucide-react";

export default function OnboardingModuleManager({ modules: initial }: { modules: any[] }) {
  const supabase = createClient();
  const router   = useRouter();
  const [modules, setModules] = useState(initial);
  const [adding,  setAdding]  = useState(false);
  const [form, setForm] = useState({ title: "", description: "", module_type: "video", is_required: true });

  const handleAdd = async () => {
    const { data } = await supabase.from("onboarding_modules").insert({
      ...form,
      order_index: modules.length + 1,
    }).select().single();
    if (data) setModules(prev => [...prev, data]);
    setAdding(false);
    setForm({ title: "", description: "", module_type: "video", is_required: true });
  };

  const handleDelete = async (id: string) => {
    await supabase.from("onboarding_modules").delete().eq("id", id);
    setModules(prev => prev.filter(m => m.id !== id));
  };

  const field = "w-full border-b border-stone bg-transparent py-2 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:border-ink font-body";

  return (
    <div className="space-y-3">
      {modules.map((m, i) => (
        <Card key={m.id} padding="sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="font-display text-2xl font-light text-warm w-8">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="font-body font-medium text-ink text-sm">{m.title}</p>
                <p className="text-muted text-xs font-body">{m.module_type} · {m.is_required ? "Required" : "Optional"}</p>
                {m.description && <p className="text-xs text-muted font-body mt-0.5">{m.description}</p>}
              </div>
            </div>
            <button onClick={() => handleDelete(m.id)} className="text-muted hover:text-red-500 transition-colors flex-shrink-0">
              <Trash2 size={14} />
            </button>
          </div>
        </Card>
      ))}

      {adding ? (
        <Card>
          <p className="text-[10px] tracking-widests uppercase text-muted mb-4 font-body">New Module</p>
          <div className="space-y-4">
            <input className={field} placeholder="Module title *" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <input className={field} placeholder="Description" value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <div className="grid grid-cols-2 gap-4">
              <select className={field} value={form.module_type}
                onChange={e => setForm(f => ({ ...f, module_type: e.target.value }))}>
                <option value="video">Video</option>
                <option value="pdf">PDF</option>
                <option value="quiz">Quiz</option>
              </select>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_required}
                  onChange={e => setForm(f => ({ ...f, is_required: e.target.checked }))}
                  className="accent-ink" />
                <span className="text-sm font-body text-ink">Required</span>
              </label>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAdd} disabled={!form.title}
                className="bg-ink text-cream text-[10px] tracking-widests uppercase font-body px-5 py-2.5 hover:bg-accent transition-colors disabled:opacity-50">
                Add Module
              </button>
              <button onClick={() => setAdding(false)}
                className="bg-stone text-muted text-[10px] tracking-widests uppercase font-body px-5 py-2.5 hover:bg-warm transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </Card>
      ) : (
        <button onClick={() => setAdding(true)}
          className="w-full border border-dashed border-stone py-4 flex items-center justify-center gap-2 text-[10px] tracking-widests uppercase text-muted hover:text-ink hover:border-warm transition-colors font-body">
          <Plus size={13} /> Add Module
        </button>
      )}
    </div>
  );
}