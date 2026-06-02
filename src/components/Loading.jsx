
export default function Loading({ size = 'medium' }) {
  const sizes = {
    small: 'h-6 w-6 border-2',
    medium: 'h-12 w-12 border-4',
    large: 'h-18 w-18 border-6'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="relative">
        <div className={`animate-spin rounded-full border-t-primary border-r-transparent border-b-transparent border-l-transparent ${sizes[size]}`}></div>
        <div className={`absolute top-0 left-0 rounded-full border-primary/20 ${sizes[size]}`}></div>
      </div>
      <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest animate-pulse emerald-glow">
        Processing Wealth Data...
      </span>
    </div>
  );
}
