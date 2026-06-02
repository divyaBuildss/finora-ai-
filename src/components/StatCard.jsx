
export default function StatCard({ title, value, change, isPositive = true, icon, color = 'emerald' }) {
  const isEmerald = color === 'emerald';

  return (
    <div className={`stat-card ${isEmerald ? '' : 'stat-card-gold'} rounded-2xl p-5 group`}>
      {/* Top: icon + label */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/70 block mb-2 leading-none">
            {title}
          </span>
          <span className={`text-2xl font-bold tracking-tight block leading-none value-ticker ${
            isEmerald ? 'text-primary emerald-glow' : 'text-secondary gold-glow'
          }`}>
            {value}
          </span>
        </div>

        {/* Icon container */}
        <div className={`ml-3 p-2.5 rounded-xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${
          isEmerald
            ? 'bg-primary/8 text-primary ring-1 ring-primary/15'
            : 'bg-secondary/8 text-secondary ring-1 ring-secondary/15'
        }`}>
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="divider-gradient mb-3" />

      {/* Bottom: change indicator */}
      {change ? (
        <div className="flex items-center gap-1.5">
          <span className={`material-symbols-outlined text-[14px] leading-none ${
            isPositive ? 'text-primary' : 'text-red-400'
          }`}>
            {isPositive ? 'arrow_upward' : 'arrow_downward'}
          </span>
          <span className={`text-[11px] font-bold leading-none ${
            isPositive ? 'text-primary' : 'text-red-400'
          }`}>
            {change}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <span className="live-dot"></span>
          <span className="text-[10px] text-on-surface-variant/50 font-medium uppercase tracking-wider">Live</span>
        </div>
      )}

      {/* Decorative radial hover glow */}
      <div className={`absolute -right-6 -bottom-6 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none ${
        isEmerald ? 'bg-primary' : 'bg-secondary'
      }`} />
    </div>
  );
}
