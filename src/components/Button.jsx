
export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
}) {
  const base =
    'relative inline-flex items-center justify-center gap-2 font-bold uppercase tracking-[0.08em] text-[11px] rounded-xl px-5 py-2.5 transition-all duration-200 active:scale-[0.96] btn-ripple select-none cursor-pointer disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed overflow-hidden';

  const variants = {
    primary:
      'bg-gradient-to-br from-primary-container to-primary text-on-primary-container shadow-lg shadow-primary/10 hover:shadow-primary/25 hover:-translate-y-[1px] hover:brightness-110 btn-primary',
    secondary:
      'bg-gradient-to-br from-secondary-container to-secondary text-on-secondary-container shadow-lg shadow-secondary/10 hover:shadow-secondary/25 hover:-translate-y-[1px] hover:brightness-110',
    outline:
      'border border-subtle/80 text-on-surface bg-transparent hover:bg-white/3 hover:border-white/20 hover:-translate-y-[1px]',
    danger:
      'bg-gradient-to-br from-red-950 to-red-800 text-white border border-red-500/25 shadow-lg hover:shadow-red-500/15 hover:-translate-y-[1px]',
    ghost:
      'text-on-surface-variant bg-transparent hover:bg-surface-glass hover:text-on-surface',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant] ?? variants.primary} ${className}`}
    >
      {children}
    </button>
  );
}
