import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    // Micro-interactions and parallax effect
    const handleMouseMove = (e) => {
      const cards = document.querySelectorAll('.glass-card');
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;

      cards.forEach(card => {
        const speed = 15;
        card.style.transform = `translateX(${x * speed}px) translateY(${y * speed}px)`;
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="bg-surface-container-lowest text-on-surface selection:bg-primary-container selection:text-on-primary-container min-h-screen">
      <Navbar />
      
      <main className="pt-20 animate-fade-in">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-margin-mobile md:px-margin-desktop overflow-hidden hero-gradient">
          <div className="z-10 max-w-3xl animate-slide-up">
            <span className="font-label-sm text-label-sm text-secondary bg-secondary-container/20 px-4 py-1 rounded-full mb-6 inline-block uppercase tracking-widest border border-secondary/30">
              AI Financial Revolution
            </span>
            <h1 className="font-display-lg text-display-lg md:text-[64px] mb-6 tracking-tighter text-on-surface">
              Your AI-Powered <br/><span className="text-primary italic">Wealth Companion</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-2xl mx-auto leading-relaxed">
              Track expenses, build smarter budgets, and grow your wealth with intelligent financial insights engineered for the next generation of investors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/signup')} variant="primary" className="px-8 py-4">
                Reserve Private Access
              </Button>
              <Button onClick={() => navigate('/login')} variant="outline" className="px-8 py-4">
                View Methodology
              </Button>
            </div>
          </div>
          
          {/* Floating Mockup */}
          <div className="relative mt-20 w-full max-w-5xl mx-auto transform perspective-1000 rotate-x-6">
            <div className="glass-card rounded-2xl p-8 shadow-2xl overflow-hidden relative group">
              <img 
                className="w-full h-auto rounded-lg opacity-80 group-hover:opacity-100 transition-opacity duration-700" 
                alt="Floating 3D Dashboard Mockup"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4tAuHHYoBuUVOzXDWKFWBXFz5sdeN_J62zJkNxW8sr483g6i-XzfaKdeXXw3SX_fIrZZyf9EMpK2bZjGvsEvfbs-VFzMoHVN-ggRl7mGgD5Hp7qVk04a1gFYv9n0MaqmVZH8EVPsW_ZcommNZ13_UkFC2HDt4G-aVvjRXT6u29Mk0DsbSOiyLOOwhveOUtS_z_5CS7sj5S4AXmKSsHNnx2v-yQrfW-YGW20fZNJ5S-FP6whisYkC9M9XR9mcq6Nnqbwcdn5kojfY"
              />
              
              {/* Floating Widget 1: Health Score */}
              <div className="absolute top-8 left-8 md:top-16 md:left-16 glass-card p-4 md:p-6 rounded-xl animate-bounce hidden md:block text-left w-48" style={{ animationDuration: '4s' }}>
                <span className="font-label-sm text-on-surface-variant uppercase block mb-1">Health Score</span>
                <span className="font-display-lg text-headline-lg text-primary emerald-glow font-bold">94.2</span>
                <div className="flex items-center text-primary mt-2">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  <span className="text-xs ml-1 font-label-md">+4.2%</span>
                </div>
              </div>
              
              {/* Floating Widget 2: Expense Alert */}
              <div className="absolute bottom-4 right-4 md:bottom-10 md:right-10 glass-card p-4 md:p-6 rounded-xl animate-pulse hidden md:block text-left w-72" style={{ animationDuration: '5s' }}>
                <div className="flex items-center gap-3">
                  <div className="bg-secondary-container p-2 rounded-lg flex-shrink-0">
                    <span className="material-symbols-outlined text-secondary">psychology</span>
                  </div>
                  <div>
                    <span className="font-label-sm text-secondary uppercase block">AI Insight</span>
                    <span className="font-body-md text-on-surface text-xs md:text-sm">Optimize SaaS spending by ₹1,400</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section className="py-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-display-lg text-headline-lg md:text-display-lg mb-4">Sophisticated Intel</h2>
            <p className="font-body-lg text-on-surface-variant max-w-xl mx-auto">
              Engineered to outperform traditional banking tools through deep learning and predictive modeling.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="glass-card p-8 rounded-2xl col-span-1 md:col-span-2 relative overflow-hidden group">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                  <span className="material-symbols-outlined text-primary text-4xl mb-4">account_balance_wallet</span>
                  <h3 className="font-headline-lg text-headline-lg mb-2">Smart Budget</h3>
                  <p className="font-body-md text-on-surface-variant max-w-sm">
                    Dynamic allocation that learns from your lifestyle, ensuring you hit investment goals without feeling the pinch.
                  </p>
                </div>
                <img 
                  className="h-40 w-auto rounded-lg object-cover opacity-60 group-hover:scale-105 transition-transform" 
                  alt="Financial flow representation"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkp5UdNewwzDvPoIK4LfvAA2yQ68_jIu8q7aFsz9svdziIC6vGv79-qxUFdwoMkY2fxdqzAOYpqyChhPAQEp5dnocn8kJ2Ei8xoEaS_ZrGBdZYg-hU-WWtOKFHtpFX_o2XEuPMzD8a5kmmfQvi33VvyOwvdYmK0d5Ts6AzS9puSGDbjCKerCDUT5Gkb9fbObGFfIbZBYQQpZvMqdlPgtAZRkR1MviY8GgT5DpzVVvNjJ8bPAic-aZYqEIERVJMkXlwb0kSPDjPvFo"
                />
              </div>
            </div>

            <div className="glass-card p-8 rounded-2xl group border-t-2 border-secondary/20">
              <span className="material-symbols-outlined text-secondary text-4xl mb-4">psychology</span>
              <h3 className="font-headline-lg text-headline-lg mb-2">AI Advisor</h3>
              <p className="font-body-md text-on-surface-variant">
                24/7 fiduciary-level guidance powered by real-time market data and personalized risk assessment.
              </p>
              <div className="mt-8 pt-8 border-t border-subtle">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-secondary animate-ping"></div>
                  <span className="font-label-sm text-secondary uppercase">Thinking...</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-8 rounded-2xl group">
              <span className="material-symbols-outlined text-primary text-4xl mb-4">payments</span>
              <h3 className="font-headline-lg text-headline-lg mb-2">Expense Intel</h3>
              <p className="font-body-md text-on-surface-variant">
                Automated categorization with deep-dive leakage detection to reclaim your capital.
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl group">
              <span className="material-symbols-outlined text-primary text-4xl mb-4">trending_up</span>
              <h3 className="font-headline-lg text-headline-lg mb-2">Investment Guidance</h3>
              <p className="font-body-md text-on-surface-variant">
                Alpha-generating strategies formerly reserved for private banking clients.
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl group">
              <span className="material-symbols-outlined text-primary text-4xl mb-4">track_changes</span>
              <h3 className="font-headline-lg text-headline-lg mb-2">Goal Planning</h3>
              <p className="font-body-md text-on-surface-variant">
                Visualise your retirement, property purchase, or legacy funds with probability mapping.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-32 bg-surface-container-low relative">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="group">
              <h4 className="font-display-lg text-[64px] text-primary mb-2 emerald-glow">₹10M+</h4>
              <p className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant">Assets Under Intelligence</p>
              <div className="h-1 w-12 bg-primary mx-auto mt-4 transition-all group-hover:w-24"></div>
            </div>
            <div className="group">
              <h4 className="font-display-lg text-[64px] text-secondary mb-2 gold-glow">50K+</h4>
              <p className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant">Daily Generated Insights</p>
              <div className="h-1 w-12 bg-secondary mx-auto mt-4 transition-all group-hover:w-24"></div>
            </div>
            <div className="group">
              <h4 className="font-display-lg text-[64px] text-ivory-white mb-2">98%</h4>
              <p className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant">Prediction Accuracy</p>
              <div className="h-1 w-12 bg-ivory-white mx-auto mt-4 transition-all group-hover:w-24"></div>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="py-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto overflow-hidden text-left">
          <div className="glass-card rounded-3xl p-12 md:p-20 relative flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1">
              <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest block mb-4">Fort Knox for Your Data</span>
              <h2 className="font-display-lg text-headline-lg md:text-display-lg mb-8">Bank-Level Security, <br/>AI-Driven Privacy</h2>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">verified_user</span>
                  <div>
                    <p className="font-headline-md text-body-lg font-bold">AES-256 Bit Encryption</p>
                    <p className="font-body-md text-on-surface-variant">Your data is encrypted at rest and in transit using the highest military-grade protocols.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">visibility_off</span>
                  <div>
                    <p className="font-headline-md text-body-lg font-bold">Zero-Knowledge Architecture</p>
                    <p className="font-body-md text-on-surface-variant">Even we can't see your personal financial details. Your privacy is non-negotiable.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="flex-1 relative">
              <div className="relative w-full aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-[spin_20s_linear_infinite]"></div>
                <div className="absolute inset-8 border border-secondary/20 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[120px] text-primary emerald-glow">security</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 px-margin-mobile md:px-margin-desktop text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display-lg text-display-lg mb-8">Ready to Elevate Your Capital?</h2>
            <p className="font-body-lg text-on-surface-variant mb-12">Join the waitlist for Finora Pro and receive a complimentary AI Wealth Audit worth ₹5,000.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input 
                className="bg-surface-container border-b-2 border-subtle focus:border-primary px-6 py-4 rounded-lg text-on-surface min-w-[250px] outline-none transition-all flex-1" 
                placeholder="Enter your business email" 
                type="email"
              />
              <Button onClick={() => navigate('/signup')} variant="primary">
                Get Early Access
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-margin-desktop px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-center max-w-container-max mx-auto border-t border-subtle bg-background">
        <div className="flex flex-col items-center md:items-start mb-10 md:mb-0">
          <div className="flex items-center gap-2 mb-4">
            <img 
              alt="Finora AI Logo" 
              className="h-6 w-auto grayscale opacity-70" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCygm_NM8kRwL1FcaJywqDwScJif6oVV6d5qK85o0ww2441ZBzYYtZmPK-xZm5G8CcF60hY1w-8uK4-ZvcdpuUFsQ3M9eOacffKlmpqrXm8-3AVL_ltlGiwp3ZNjNTl5adqYKnx76zztVoQ7-4cvGM59sEJ1CcqCPPzf4M7rx4DOHu3D4s7IOfMo_EQbi2EDLPVvWTWudbZ2fwuEMM3AlPF6hV-CMXaas_vOZlQ0M0NLnrETqbHBQdRZHD2ALBcg2Ttds8RcBNxcF0"
            />
            <span className="font-headline-md text-headline-md text-primary font-bold">Finora AI</span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant opacity-60">© 2026 Finora AI. All rights reserved.</p>
        </div>
        
        <nav className="flex flex-wrap justify-center gap-8 mb-10 md:mb-0">
          <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-secondary transition-colors" href="#" onClick={e => e.preventDefault()}>Privacy Policy</a>
          <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-secondary transition-colors" href="#" onClick={e => e.preventDefault()}>Terms of Service</a>
          <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-secondary transition-colors" href="#" onClick={e => e.preventDefault()}>Security</a>
          <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-secondary transition-colors" href="#" onClick={e => e.preventDefault()}>Contact</a>
        </nav>
      </footer>
    </div>
  );
}
