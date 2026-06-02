import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';

import { databaseService } from '../services/databaseService';
import { useAuth } from '../hooks/useAuth';
import { formatINR, calculateHealthScore } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [goals, setGoals] = useState([]);
  const [budgets, setBudgets] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const uid = currentUser?.uid || 'demo_user';
        const [expData, goalsData, budgetData] = await Promise.all([
          databaseService.getExpenses(uid),
          databaseService.getGoals(uid),
          databaseService.fetchBudgets(uid)
        ]);
        setExpenses(expData);
        setGoals(goalsData);
        setBudgets(budgetData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [currentUser]);

  // Fetch dynamic variables from current client profile, falling back gracefully
  const income = currentUser?.monthlyIncome || 150000;
  const profileExpenses = currentUser?.monthlyExpenses || 60000;
  
  // Calculate stats dynamically - guard against non-array values during async loading
  const expensesArr = Array.isArray(expenses) ? expenses : [];
  const goalsArr = Array.isArray(goals) ? goals : [];
  const totalLoggedExpenses = expensesArr.reduce((acc, curr) => acc + curr.amount, 0);
  const totalBalance = (income * 12) - totalLoggedExpenses;
  

  

  // Group expenses by category for pie representation
  const getCategoryBreakdown = () => {
    const categories = {};
    expensesArr.forEach(e => {
      categories[e.category] = (categories[e.category] || 0) + e.amount;
    });
    
    const total = Object.values(categories).reduce((a, b) => a + b, 0) || 1;
    return Object.keys(categories).map(cat => ({
      name: cat,
      amount: categories[cat],
      ratio: ((categories[cat] / total) * 100).toFixed(0)
    }));
  };

  const categoriesData = getCategoryBreakdown();

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen page-gradient">

      <Navbar />
      <Sidebar />

      <main className="lg:pl-64 pt-20">
        <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6 text-left">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-subtle/60">
            <div>
              <span className="text-[10px] uppercase tracking-[0.12em] text-primary font-bold flex items-center gap-1.5">
                <span className="live-dot"></span>
                Live Dashboard
              </span>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-on-surface mt-1">Wealth Intelligence</h1>
            </div>
          </div>

          {/* Stat Cards */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="stat-card rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-2 w-16" rounded="rounded-full" />
                      <Skeleton className="h-6 w-24" rounded="rounded-lg" />
                    </div>
                    <Skeleton className="h-9 w-9" rounded="rounded-xl" />
                  </div>
                  <div className="divider-gradient" />
                  <Skeleton className="h-2 w-20" rounded="rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="stagger-1 animate-fade-in"><StatCard title="Net Balance" value={formatINR(totalBalance)} icon="account_balance" color="emerald" /></div>
              <div className="stagger-2 animate-fade-in"><StatCard title="Monthly Income" value={formatINR(income)} icon="payments" color="emerald" /></div>
              <div className="stagger-3 animate-fade-in"><StatCard title="Total Spent" value={formatINR(totalLoggedExpenses)} change={`${expensesArr.length} transactions`} isPositive={totalLoggedExpenses < profileExpenses} icon="shopping_bag" color="gold" /></div>
              <div className="stagger-4 animate-fade-in"><StatCard title="Financial Score" value={`${calculateHealthScore(budgets, expensesArr)}`} change="health index" isPositive={calculateHealthScore(budgets, expensesArr) >= 75} icon="insights" color="emerald" /></div>
            </div>
          )}

          {/* Charts Row */}
          <div className="grid grid-cols-1 gap-4">

            {/* Income vs Expense chart */}
            <div className="glass-card p-5 rounded-2xl">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-on-surface tracking-tight">Income vs Expense</h3>
                  <p className="text-[11px] text-on-surface-variant/60 mt-0.5">Yearly liquidity flow</p>
                </div>
                <div className="flex gap-3 text-[10px] font-bold">
                  <span className="flex items-center gap-1 text-primary"><span className="w-2 h-0.5 bg-primary rounded inline-block" /> Income</span>
                  <span className="flex items-center gap-1 text-secondary"><span className="w-2 h-0.5 bg-secondary rounded inline-block" /> Expenses</span>
                </div>
              </div>
              <div className="relative h-52 w-full">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#59de9b" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#59de9b" stopOpacity="0" />
                    </linearGradient>
                    <filter id="lineGlow"><feGaussianBlur stdDeviation="1.2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                  </defs>
                  {[25, 50, 75].map(y => <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" strokeDasharray="3 3" />)}
                  <path d="M 0 50 Q 25 30 50 25 T 100 15 L 100 100 L 0 100 Z" fill="url(#incomeGrad)" />
                  <path d="M 0 50 Q 25 30 50 25 T 100 15" fill="none" stroke="#59de9b" strokeWidth="2" strokeLinecap="round" filter="url(#lineGlow)" />
                  <path d="M 0 85 Q 25 75 50 65 T 100 55" fill="none" stroke="#e9c349" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
                  <circle cx="100" cy="15" r="2.5" fill="#59de9b" filter="url(#lineGlow)" />
                </svg>
                <div className="absolute left-0 top-0 text-[9px] text-primary font-bold font-mono">{formatINR(income)}/mo</div>
                <div className="absolute left-0 bottom-0 text-[9px] text-secondary font-bold font-mono">{formatINR(totalLoggedExpenses)} spent</div>
              </div>
            </div>
          </div>

          {/* Goals & Category Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Active Goals */}
            <div className="glass-card p-5 rounded-2xl animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Wealth Targets</h3>
                <button onClick={() => navigate('/goals')} className="text-[10px] text-primary hover:text-primary/80 font-bold uppercase tracking-wider transition-colors">View all ›</button>
              </div>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10" rounded="rounded-xl" />)}
                </div>
              ) : goalsArr.length === 0 ? (
                <EmptyState title="No Goals Yet" message="Set your first financial goal to start tracking progress." icon="track_changes" action="Add Goal" onAction={() => navigate('/goals')} />
              ) : (
                <div className="space-y-3">
                  {goalsArr.slice(0, 3).map((g) => {
                    const pct = Math.min((g.current / g.target) * 100, 100);
                    return (
                      <div key={g.id} className="table-row-hover p-3 rounded-xl transition-colors">
                        <div className="flex justify-between items-baseline mb-2">
                          <span className="text-[12px] font-bold text-on-surface truncate pr-2">{g.name}</span>
                          <span className="text-[10px] text-primary font-bold font-mono flex-shrink-0">{pct.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden progress-bar">
                          <div
                            className="h-full bg-gradient-to-r from-primary/70 to-primary rounded-full transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1.5">
                          <span className="text-[10px] text-on-surface-variant/50">{formatINR(g.current)}</span>
                          <span className="text-[10px] text-on-surface-variant/50">{formatINR(g.target)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Outflow Breakdown */}
            <div className="glass-card p-5 rounded-2xl animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Spend Breakdown</h3>
                <button onClick={() => navigate('/expenses')} className="text-[10px] text-secondary hover:text-secondary/80 font-bold uppercase tracking-wider transition-colors">View all ›</button>
              </div>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10" rounded="rounded-xl" />)}
                </div>
              ) : categoriesData.length === 0 ? (
                <EmptyState title="No Expenses" message="Add expenses to see category breakdown." icon="pie_chart" action="Add Expense" onAction={() => navigate('/expenses')} />
              ) : (
                <div className="space-y-3">
                  {categoriesData.map((item) => (
                    <div key={item.name} className="table-row-hover p-3 rounded-xl">
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="text-[12px] font-bold text-on-surface capitalize">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-on-surface-variant/50">{item.ratio}%</span>
                          <span className="text-[11px] text-secondary font-bold font-mono">{formatINR(item.amount)}</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden progress-bar">
                        <div
                          className="h-full bg-gradient-to-r from-secondary/60 to-secondary rounded-full transition-all duration-700"
                          style={{ width: `${item.ratio}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
