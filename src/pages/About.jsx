import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../hooks/useAuth';


export default function About() {
  const { currentUser } = useAuth();

  const technologies = [
    { name: 'React 19', category: 'Frontend', icon: 'code', desc: 'Modern component-based user interface architecture.' },
    { name: 'Vite 8', category: 'Frontend', icon: 'bolt', desc: 'Ultra-fast Next Generation Frontend tooling & hot module reloading.' },
    { name: 'Tailwind CSS', category: 'Frontend', icon: 'palette', desc: 'Premium custom design styling using vanilla CSS custom bounds.' },
    { name: 'Firebase Auth', category: 'Backend', icon: 'badge', desc: 'Secure OAuth credentials (Google) and Email/Password flows.' },
    { name: 'Cloud Firestore', category: 'Backend', icon: 'database', desc: 'Realtime NoSQL document store implementing owner-only isolation rules.' },
    { name: 'Gemini 2.5 Flash', category: 'AI Engine', icon: 'psychology', desc: 'Generative wealth advisory modeling & custom goal heuristics.' },
    { name: 'Vercel', category: 'Deployment', icon: 'cloud_upload', desc: 'Global edge-network optimization hosting the production environment.' }
  ];

  const features = [
    { title: 'Secure Authentication', icon: 'lock' },
    { title: 'AI Financial Dashboard', icon: 'space_dashboard' },
    { title: 'Gemini AI Finance Advisor', icon: 'chat' },
    { title: 'Smart Expense Tracking', icon: 'payments' },
    { title: 'AI Budget Planner', icon: 'account_balance_wallet' },
    { title: 'Investment Advisor', icon: 'trending_up' },
    { title: 'Goal Planner', icon: 'track_changes' },
    { title: 'Subscription Detection', icon: 'autorenew' },
    { title: 'PDF Reports', icon: 'picture_as_pdf' },
    { title: 'CSV Export', icon: 'csv' }
  ];

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen page-gradient">
      <Navbar />
      {currentUser && <Sidebar />}
      
      <main className={`${currentUser ? 'lg:pl-64' : ''} pt-32 pb-16`}>
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-12 text-left">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-subtle pb-6 animate-fade-in">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Academic Demonstration</span>
              <h1 className="font-display-lg text-headline-lg font-bold mt-1">About FINORA AI</h1>
            </div>
            <div>
              <span className="text-xs text-on-surface-variant font-mono uppercase bg-surface-glass border border-subtle px-3 py-1.5 rounded-full">
                VER. v1.2.0 | Stable
              </span>
            </div>
          </div>

          {/* Section 1: Overview */}
          <section className="glass-card p-8 rounded-3xl space-y-4 animate-slide-up">
            <h2 className="text-lg font-bold text-primary uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">info</span>
              Project Overview
            </h2>
            <p className="text-sm text-on-surface-variant/90 leading-relaxed font-light">
              <strong>FINORA AI</strong> is a premium, AI-powered personal finance companion engineered to deliver institutional-grade wealth planning experiences. Designed with a luxury dark glassmorphism layout, it helps users track transactional outflows, set smart budgets, formulate target wealth goals, detect recurring subscriptions, and interact with a simulated Google Gemini advisor contextually bound to their current financial statements.
            </p>
          </section>

          {/* Section 2: Technology Stack */}
          <section className="space-y-6">
            <h2 className="text-lg font-bold text-primary uppercase tracking-wider flex items-center gap-2 px-2">
              <span className="material-symbols-outlined text-primary">layers</span>
              Architectural Blueprints
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {technologies.map((tech, idx) => (
                <div 
                  key={tech.name} 
                  className="glass-card p-5 rounded-2xl flex flex-col justify-between space-y-3 stagger-1 animate-fade-in"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex justify-between items-start">
                    <span className="material-symbols-outlined p-2 rounded-xl bg-surface-glass text-secondary">
                      {tech.icon}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                      {tech.category}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-on-surface">{tech.name}</h3>
                    <p className="text-[11px] text-on-surface-variant/75 mt-1 leading-normal font-light">
                      {tech.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Core Features */}
          <section className="space-y-6">
            <h2 className="text-lg font-bold text-primary uppercase tracking-wider flex items-center gap-2 px-2">
              <span className="material-symbols-outlined text-primary">verified</span>
              Functional Deliverables
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {features.map((feat, idx) => (
                <div 
                  key={feat.title} 
                  className="glass-card p-4 rounded-xl flex items-center gap-3 hover:border-primary/40 stagger-2 animate-fade-in"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <span className="material-symbols-outlined text-primary text-base">
                    {feat.icon === 'csv' || feat.icon === 'pdf' ? 'description' : feat.icon}
                  </span>
                  <span className="font-bold text-[11px] text-on-surface truncate">
                    {feat.title}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Section 4: System Information */}
          <section className="glass-card p-6 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-6 animate-slide-up">
            <div className="space-y-2">
              <h4 className="text-xs uppercase tracking-wider text-on-surface-variant font-bold">Release Mandate</h4>
              <p className="text-xs text-on-surface font-mono">Build Version: v1.2.0-release</p>
              <p className="text-xs text-on-surface font-mono">Environment: Client-Side Edge Container</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs uppercase tracking-wider text-on-surface-variant font-bold">Verification Index</h4>
              <p className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                <span className="live-dot bg-emerald-400"></span> 30/30 TestSprite Automation Verified
              </p>
              <p className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                <span className="live-dot bg-emerald-400"></span> Local Firestore Rules Enforced
              </p>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
