
const iconMap = {
  inbox: 'inbox',
  receipt_long: 'receipt_long',
  track_changes: 'track_changes',
  pie_chart: 'pie_chart',
  savings: 'savings',
  analytics: 'analytics',
};

export default function EmptyState({ title, message, icon = 'inbox', action, onAction }) {
  return (
    <div className="w-full flex flex-col items-center justify-center text-center py-12 px-6 animate-fade-in">
      {/* Icon container with layered rings */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-primary/5 scale-150 blur-xl" />
        <div className="relative w-16 h-16 rounded-2xl bg-surface-container border border-subtle flex items-center justify-center ring-1 ring-white/5">
          <span className="material-symbols-outlined text-[32px] text-on-surface-variant/50">
            {iconMap[icon] || icon}
          </span>
        </div>
      </div>

      <h3 className="text-sm font-bold text-on-surface mb-2 tracking-tight">{title}</h3>
      <p className="text-[12px] text-on-surface-variant/60 max-w-[220px] leading-relaxed mb-6">{message}</p>

      {action && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary border border-primary/30 bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-lg transition-all hover:-translate-y-[1px]"
        >
          <span className="material-symbols-outlined text-[14px]">add</span>
          {action}
        </button>
      )}
    </div>
  );
}
