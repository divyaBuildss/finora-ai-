import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen">
      <Navbar />
      
      <main className="pt-32 flex flex-col items-center justify-center min-h-[80vh] px-4 relative hero-gradient text-center">
        <div className="max-w-md glass-card rounded-2xl p-8 relative z-10 space-y-6">
          <div className="relative w-36 h-36 mx-auto mb-2 flex items-center justify-center">
            {/* Decorative Glowing Rings */}
            <div className="absolute inset-0 border-2 border-red-500/20 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
            <div className="absolute inset-4 border border-secondary/20 rounded-full animate-pulse"></div>
            <span className="material-symbols-outlined text-[72px] text-secondary gold-glow">
              gpp_bad
            </span>
          </div>

          <div className="space-y-2">
            <span className="font-label-sm text-label-sm text-secondary bg-secondary-container/20 px-4 py-1 rounded-full uppercase tracking-widest border border-secondary/30">
              Security Override
            </span>
            <h2 className="font-display-lg text-headline-lg font-bold">404 - Mandate Not Found</h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              The capital coordinate or financial vault you have requested does not exist or has been shifted.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/')} variant="primary" className="w-full sm:w-auto">
              Return Home
            </Button>
            <Button onClick={() => navigate(-1)} variant="outline" className="w-full sm:w-auto">
              Go Back
            </Button>
          </div>
        </div>

        {/* Backdrop Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl -z-10"></div>
      </main>
    </div>
  );
}
