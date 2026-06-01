interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
      {icon && <div className="text-warm mb-4">{icon}</div>}
      <p className="font-display text-xl font-light text-ink mb-2">{title}</p>
      {description && (
        <p className="text-muted text-sm font-body max-w-sm leading-relaxed mb-6">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}