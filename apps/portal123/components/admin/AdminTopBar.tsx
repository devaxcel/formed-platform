interface AdminTopBarProps {
  userEmail: string;
  adminRole: string;
}

export default function AdminTopBar({ adminRole }: AdminTopBarProps) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric"
  });

  return (
    <div className="h-14 border-b border-stone bg-cream flex items-center justify-between px-6 lg:px-8 flex-shrink-0">
      <p className="text-muted text-xs font-body hidden sm:block">{dateStr}</p>
      <div className="flex items-center gap-3 ml-auto">
        <span className="text-[10px] tracking-widest uppercase font-body px-3 py-1 bg-ink text-cream">
          {adminRole.replace(/_/g, " ")}
        </span>
      </div>
    </div>
  );
}