import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import Button from '../components/Button';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { databaseService } from '../services/databaseService';
import { geminiService } from '../services/geminiService';
import { useAuth } from '../hooks/useAuth';
import { formatINR } from '../utils/helpers';

const getRemainingMonths = (deadlineStr) => {
  const today = new Date();
  const deadlineDate = new Date(deadlineStr);
  let months = (deadlineDate.getFullYear() - today.getFullYear()) * 12;
  months -= today.getMonth();
  months += deadlineDate.getMonth();
  return months <= 0 ? 0 : months;
};

export default function Goals() {
  const { currentUser } = useAuth();
  const [goals, setGoals] = useState([]);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');
  const [deadline, setDeadline] = useState('');

  const [updateGoalId, setUpdateGoalId] = useState('');
  const [updateAmt, setUpdateAmt] = useState('');
  const [aiAdvice, setAiAdvice] = useState({});
  const [loadingAdviceId, setLoadingAdviceId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const uid = currentUser?.uid || 'demo_user';
        const data = await databaseService.getGoals(uid);
        setGoals(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGoals();
  }, [currentUser]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name || !target || !current || !deadline) return;

    const uid = currentUser?.uid || 'demo_user';
    const newGoal = await databaseService.saveGoal({
      name,
      target: parseFloat(target),
      current: parseFloat(current),
      deadline
    }, uid);

    setGoals(prev => [...prev, newGoal]);
    setName('');
    setTarget('');
    setCurrent('');
    setDeadline('');
  };

  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    if (!updateGoalId || !updateAmt) return;

    const uid = currentUser?.uid || 'demo_user';
    const updated = await databaseService.updateGoalProgress(updateGoalId, parseFloat(updateAmt), uid);
    setGoals(updated);
    setUpdateGoalId('');
    setUpdateAmt('');
  };

  const handleGetAdvice = async (goal) => {
    setLoadingAdviceId(goal.id);
    const advice = await geminiService.analyzeGoal(goal);
    setAiAdvice(prev => ({ ...prev, [goal.id]: advice }));
    setLoadingAdviceId(null);
  };

  const totalAUM = goals.reduce((acc, curr) => acc + curr.current, 0);
  const totalTarget = goals.reduce((acc, curr) => acc + curr.target, 0);

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen">
      <Navbar />
      <Sidebar />
      
      <main className="lg:pl-64 pt-20">
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 text-left">
          
          {/* Header */}
          <div className="flex justify-between items-center border-b border-subtle pb-6">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Goal Architecture</span>
              <h1 className="font-display-lg text-headline-lg font-bold">Wealth Goals & Target Milestones</h1>
            </div>
            <div className="text-right">
              <span className="text-[10px] block text-on-surface-variant">ACTIVE TARGET AUM</span>
              <span className="font-display-lg text-headline-lg text-primary font-bold emerald-glow">
                {formatINR(totalAUM)}
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            <StatCard 
              title="Consolidated Accumulation" 
              value={formatINR(totalAUM)} 
              icon="track_changes"
              color="emerald"
            />
            <StatCard 
              title="Consolidated Target Capital" 
              value={formatINR(totalTarget)} 
              icon="tour"
              color="emerald"
            />
            <StatCard 
              title="Accumulation Ratio" 
              value={`${totalTarget > 0 ? ((totalAUM / totalTarget) * 100).toFixed(1) : 0}%`} 
              icon="percent"
              color="emerald"
            />
          </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Create Goal Form */}
            <div className="glass-card p-6 rounded-2xl h-fit space-y-6">
              <div className="border-b border-subtle/50 pb-4">
                <h3 className="font-bold text-sm uppercase tracking-wider text-primary">Map New Wealth Target</h3>
                <form onSubmit={handleCreate} className="space-y-3 mt-3">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Goal Name (e.g. Trust Fund)"
                    className="w-full bg-surface-container border-b border-subtle focus:border-primary px-3 py-2 rounded text-xs text-on-surface outline-none"
                  />
                  <input
                    type="number"
                    required
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="Target Amount (₹)"
                    className="w-full bg-surface-container border-b border-subtle focus:border-primary px-3 py-2 rounded text-xs text-on-surface outline-none font-mono"
                  />
                  <input
                    type="number"
                    required
                    value={current}
                    onChange={(e) => setCurrent(e.target.value)}
                    placeholder="Starting Asset Reserve (₹)"
                    className="w-full bg-surface-container border-b border-subtle focus:border-primary px-3 py-2 rounded text-xs text-on-surface outline-none font-mono"
                  />
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-surface-container border border-subtle focus:border-primary px-3 py-2 rounded text-xs text-on-surface outline-none"
                  />
                  <Button type="submit" variant="primary" className="w-full mt-2">
                    Architect Wealth Target
                  </Button>
                </form>
              </div>

              {/* Update Goal progress */}
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider text-secondary">AUM Re-injection</h3>
                <form onSubmit={handleUpdateProgress} className="space-y-3 mt-3">
                  <select
                    value={updateGoalId}
                    onChange={(e) => setUpdateGoalId(e.target.value)}
                    className="w-full bg-surface-container border border-subtle focus:border-primary px-3 py-2 rounded text-xs text-on-surface outline-none"
                    required
                  >
                    <option value="">-- Choose Target --</option>
                    {goals.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    required
                    value={updateAmt}
                    onChange={(e) => setUpdateAmt(e.target.value)}
                    placeholder="Enter Current Balance (₹)"
                    className="w-full bg-surface-container border-b border-subtle focus:border-primary px-3 py-2 rounded text-xs text-on-surface outline-none font-mono"
                  />
                  <Button type="submit" variant="secondary" className="w-full mt-2">
                    Update Balance Reserve
                  </Button>
                </form>
              </div>
            </div>

            {/* Goals List Grid with Meters */}
            <div className="col-span-1 md:col-span-2 space-y-6">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                </div>
              ) : goals.length === 0 ? (
                <EmptyState 
                  title="No Wealth Targets Found" 
                  message="Start building your portfolio by architecting a new wealth target." 
                  icon="track_changes" 
                />
              ) : (
                goals.map(g => {
                  const ratio = (g.current / g.target) * 100;
                  const monthsLeft = getRemainingMonths(g.deadline);
                  const monthlyNeeded = monthsLeft > 0 ? Math.max(0, g.target - g.current) / monthsLeft : 0;
                  
                  return (
                    <div key={g.id} className="glass-card p-6 rounded-2xl text-left relative overflow-hidden group space-y-4 animate-fade-in">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm text-on-surface">{g.name}</h4>
                          <span className="text-[10px] text-on-surface-variant block mt-1">Deadline: {g.deadline} ({monthsLeft} months left)</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-on-surface-variant uppercase block">Target AUM</span>
                          <span className="text-xs font-bold text-secondary font-mono">{formatINR(g.target)}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-on-surface-variant">Asset Progress Balance</span>
                          <span className="font-bold font-mono text-primary">{formatINR(g.current)} ({ratio.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-primary-fixed-dim rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(ratio, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-subtle/50 text-xs">
                         <div>
                           <span className="text-on-surface-variant block text-[10px] uppercase">Monthly Req.</span>
                           <span className="font-bold font-mono text-on-surface">{monthsLeft > 0 ? formatINR(monthlyNeeded) : 'Overdue/Done'}</span>
                         </div>
                         <Button 
                           variant="secondary" 
                           className="text-[10px] py-1 px-3"
                           onClick={() => handleGetAdvice(g)}
                           disabled={loadingAdviceId === g.id}
                         >
                           {loadingAdviceId === g.id ? 'Analyzing...' : 'Get AI Advice'}
                         </Button>
                      </div>

                      {aiAdvice[g.id] && (
                        <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg text-xs text-primary-fixed-dim">
                          <div className="font-bold mb-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">smart_toy</span> 
                            Finora AI Insight
                          </div>
                          <p>{aiAdvice[g.id]}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
