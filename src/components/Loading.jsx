export default function Loading({ size = 'medium', fullScreen = false }) {
  const sizes = {
    small: 'h-6 w-6 border-2',
    medium: 'h-12 w-12 border-4',
    large: 'h-18 w-18 border-6'
  };

  if (fullScreen) {
    return (
      <div 
        role="status" 
        aria-label="Loading FINORA AI"
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0b0f0d] text-[#e0e3df] p-6 animate-fade-in"
      >
        {/* Background Decorative Premium Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0b1f14] rounded-full blur-[120px] opacity-40 pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#e9c349]/5 rounded-full blur-[120px] pointer-events-none animate-pulse delay-700"></div>

        {/* Loading Content Wrapper */}
        <div className="flex flex-col items-center text-center space-y-6 max-w-sm relative z-10">
          
          {/* Stylized Luxury Logo Mark with pulsing border */}
          <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-b from-[#122c1d] to-[#0b1410] border border-[#e9c349]/20 shadow-2xl shadow-[#0b1f14]/50 animate-pulse">
            {/* Spinning gold accent ring */}
            <div className="absolute inset-0 rounded-full border-t-2 border-[#e9c349] border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            
            {/* Logo Graphic: Golden balance wallet */}
            <div className="relative flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-[#e9c349] font-light filter drop-shadow-[0_0_10px_rgba(233,195,73,0.4)]">
                account_balance_wallet
              </span>
            </div>
          </div>

          {/* Branding Texts */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-[0.25em] text-white">
              FINORA <span className="text-[#e9c349]">AI</span>
            </h1>
            <p className="text-[10px] text-[#59de9b] tracking-[0.15em] uppercase font-mono animate-pulse">
              Preparing your financial dashboard...
            </p>
          </div>

          {/* Subtle Progress Track */}
          <div className="w-48 h-0.5 bg-[#122c1d] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#e9c349]/50 to-[#e9c349] rounded-full loading-progress-bar"></div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback inline loader
  return (
    <div 
      role="status" 
      aria-label="Loading data"
      className="flex flex-col items-center justify-center gap-3 py-8"
    >
      <div className="relative">
        <div className={`animate-spin rounded-full border-t-[#e9c349] border-r-transparent border-b-transparent border-l-transparent ${sizes[size]}`}></div>
        <div className={`absolute top-0 left-0 rounded-full border-[#e9c349]/10 ${sizes[size]}`}></div>
      </div>
      <span className="font-mono text-[9px] text-[#59de9b] uppercase tracking-widest animate-pulse">
        Processing Wealth Data...
      </span>
    </div>
  );
}
