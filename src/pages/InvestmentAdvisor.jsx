import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import Button from '../components/Button';
import Skeleton from '../components/Skeleton';
import { useAuth } from '../hooks/useAuth';
import { formatINR } from '../utils/helpers';
import { databaseService } from '../services/databaseService';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

// Pure helper function declared outside component to bypass react hook purity rules
const generatePlanId = () => `inv_${Math.random().toString(36).substr(2, 9)}`;

export default function InvestmentAdvisor() {
  const { currentUser } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [goals, setGoals] = useState([]);
  const [savedPlans, setSavedPlans] = useState([]);
  const [toast, setToast] = useState(null);

  // SIP States
  const [monthlyInvest, setMonthlyInvest] = useState(15000);
  const [expectedRate, setExpectedRate] = useState(12);
  const [horizonYears, setHorizonYears] = useState(10);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const loadAdvisorData = async () => {
      setIsLoading(true);
      try {
        const uid = currentUser?.uid || 'demo_user';
        const [goalsData, plansData] = await Promise.all([
          databaseService.getGoals(uid),
          databaseService.getInvestments(uid)
        ]);
        
        setGoals(goalsData || []);
        setSavedPlans(plansData || []);

        const incomeVal = currentUser?.monthlyIncome || 150000;
        const expensesVal = currentUser?.monthlyExpenses || 60000;
        const savings = Math.max(0, incomeVal - expensesVal);
        setMonthlyInvest(savings > 0 ? savings : 15000);

        const risk = currentUser?.riskProfile || 'balanced';
        if (risk === 'aggressive') setExpectedRate(15);
        else if (risk === 'conservative') setExpectedRate(8);
        else setExpectedRate(12);
      } catch (err) {
        console.error("Error loading investment data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadAdvisorData();
  }, [currentUser]);

  // Profile data
  const age = currentUser?.age || 28;
  const income = currentUser?.monthlyIncome || 150000;
  const expenses = currentUser?.monthlyExpenses || 60000;
  const monthlySavings = Math.max(0, income - expenses);
  const riskProfile = currentUser?.riskProfile || 'balanced';

  // Portfolio calculation based on goals current values
  const portfolioValue = goals.reduce((acc, g) => acc + (g.current || 0), 0) || (monthlySavings * 12 || 100000);


  // Generate dynamic recommendation assets
  const getAssetAllocation = () => {
    if (riskProfile === 'conservative') {
      return [
        { name: 'Fixed Deposits (FD)', weight: 40, allocation: portfolioValue * 0.40, color: 'bg-primary' },
        { name: 'Debt Mutual Funds', weight: 40, allocation: portfolioValue * 0.40, color: 'bg-secondary' },
        { name: 'Sovereign Gold Bonds', weight: 20, allocation: portfolioValue * 0.20, color: 'bg-outline' }
      ];
    } else if (riskProfile === 'aggressive') {
      return [
        { name: 'Direct Equities / Stocks', weight: 50, allocation: portfolioValue * 0.50, color: 'bg-primary' },
        { name: 'Equity Mutual Funds', weight: 30, allocation: portfolioValue * 0.30, color: 'bg-secondary' },
        { name: 'Index Mutual Funds', weight: 20, allocation: portfolioValue * 0.20, color: 'bg-outline' }
      ];
    } else {
      // Balanced/Medium Risk
      return [
        { name: 'Index Mutual Funds', weight: 50, allocation: portfolioValue * 0.50, color: 'bg-primary' },
        { name: 'Diversified Mutual Funds', weight: 30, allocation: portfolioValue * 0.30, color: 'bg-secondary' },
        { name: 'Sovereign Gold Bonds', weight: 20, allocation: portfolioValue * 0.20, color: 'bg-outline' }
      ];
    }
  };

  const currentAllocation = getAssetAllocation();

  const handleSavePlan = async () => {
    setIsSaving(true);
    try {
      const uid = currentUser?.uid || 'demo_user';
      const planToSave = {
        id: generatePlanId(),
        userId: uid,
        riskProfile,
        monthlyAmount: monthlySavings,
        allocation: currentAllocation.map(a => ({ name: a.name, weight: a.weight, amount: a.allocation })),
        createdAt: new Date().toISOString()
      };

      await databaseService.saveInvestment(planToSave, uid);
      const updatedPlans = await databaseService.getInvestments(uid);
      setSavedPlans(updatedPlans);
      showToast("Investment plan saved to Firestore", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to save investment plan", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // 1. SIP Growth Chart Data
  const getSipGrowthData = () => {
    const data = [];
    const monthlyRate = expectedRate / 12 / 100;
    
    for (let year = 1; year <= horizonYears; year++) {
      const months = year * 12;
      const totalInvested = monthlyInvest * months;
      const totalWealth = monthlyInvest * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
      const wealthGained = Math.max(0, totalWealth - totalInvested);
      
      data.push({
        year: `Yr ${year}`,
        Invested: Math.round(totalInvested),
        Gains: Math.round(wealthGained),
        Total: Math.round(totalWealth)
      });
    }
    return data;
  };
  const sipChartData = getSipGrowthData();

  // 2. Portfolio Timeline projection
  const getTimelineData = () => {
    const data = [];
    const monthlyRate = expectedRate / 12 / 100;
    const yearsToProject = Math.max(horizonYears, 15);
    
    for (let year = 1; year <= yearsToProject; year++) {
      const months = year * 12;
      const invested = monthlyInvest * months;
      const wealth = monthlyInvest * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
      data.push({
        year: `Yr ${year}`,
        Portfolio: Math.round(wealth),
        Principal: Math.round(invested)
      });
    }
    return data;
  };
  const timelineChartData = getTimelineData();

  // Compound math for static calculations
  const calculateSIPResult = () => {
    const months = horizonYears * 12;
    const totalInvestment = monthlyInvest * months;
    const monthlyRate = expectedRate / 12 / 100;
    const totalWealth = monthlyInvest * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    const wealthGained = Math.max(0, totalWealth - totalInvestment);
    return {
      totalInvestment,
      wealthGained,
      totalWealth
    };
  };
  const sipResult = calculateSIPResult();

  // Risk Score metadata
  const getRiskScore = () => {
    if (riskProfile === 'aggressive') {
      return { score: 85, color: 'text-purple-400', barColor: 'bg-purple-500', desc: 'Aggressive - Focus on Equity Alpha' };
    } else if (riskProfile === 'conservative') {
      return { score: 25, color: 'text-emerald-400', barColor: 'bg-emerald-500', desc: 'Conservative - Capital Preservation' };
    }
    return { score: 55, color: 'text-secondary', barColor: 'bg-secondary', desc: 'Balanced - Moderate Dynamic Growth' };
  };
  const riskMeta = getRiskScore();

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen">
      <Navbar />
      <Sidebar />
      
      <main className="lg:pl-64 pt-20">
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 text-left">
          
          {/* Header */}
          <div className="flex justify-between items-center border-b border-subtle pb-6">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Capital Allocation</span>
              <h1 className="font-display-lg text-headline-lg font-bold">Robo-Portfolios & Capital Advisors</h1>
            </div>
            <div className="text-right">
              <span className="text-[10px] block text-on-surface-variant">PORTFOLIO VALUATION</span>
              <span className="font-display-lg text-headline-lg text-primary font-bold emerald-glow">
                {isLoading ? '...' : formatINR(portfolioValue)}
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Skeleton className="h-60" />
                <Skeleton className="h-60" />
              </div>
            </div>
          ) : (
            <>
              {/* Quick Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-fade-in">
                <StatCard 
                  title="Dynamic Portfolio AUM" 
                  value={formatINR(portfolioValue)} 
                  icon="smart_toy"
                  color="emerald"
                />
                <StatCard 
                  title="Expected Yield" 
                  value={`${expectedRate}% p.a.`} 
                  change={`Model: ${riskProfile}`}
                  isPositive={true}
                  icon="show_chart"
                  color="emerald"
                />
                <StatCard 
                  title="Monthly Surplus Target" 
                  value={formatINR(monthlySavings)} 
                  change={`Outlay cap: ${formatINR(expenses)}`}
                  isPositive={monthlySavings > 0}
                  icon="savings"
                  color="emerald"
                />
              </div>

              {/* Layout Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Investment Profile & Risk Score Card */}
                <div className="space-y-6 lg:col-span-1">
                  
                  {/* Investment Profile */}
                  <div className="glass-card p-6 rounded-2xl text-left space-y-4">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-primary border-b border-subtle/30 pb-3">
                      Investment Profile
                    </h3>
                    <div className="space-y-3.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-on-surface-variant font-bold">Client Age</span>
                        <span className="font-mono text-on-surface font-semibold">{age} Years</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-on-surface-variant font-bold">Monthly Income</span>
                        <span className="font-mono text-on-surface font-semibold">{formatINR(income)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-on-surface-variant font-bold">Monthly Surplus</span>
                        <span className="font-mono text-primary font-bold">{formatINR(monthlySavings)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-on-surface-variant font-bold">Risk Allocation Bounds</span>
                        <span className="font-bold text-secondary capitalize">{riskProfile}</span>
                      </div>
                    </div>
                  </div>

                  {/* Risk Score Card */}
                  <div className="glass-card p-6 rounded-2xl text-left space-y-4">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-secondary">
                      Volatility Risk Score
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-on-surface-variant">Profile Score:</span>
                        <span className={`text-2xl font-black font-mono ${riskMeta.color}`}>{riskMeta.score}<span className="text-[10px] text-on-surface-variant">/100</span></span>
                      </div>
                      <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ${riskMeta.barColor}`}
                          style={{ width: `${riskMeta.score}%` }}
                        ></div>
                      </div>
                      <p className="text-[10px] text-on-surface-variant/80 italic leading-relaxed pt-1">
                        {riskMeta.desc}. Volatility boundaries are re-balanced quarterly.
                      </p>
                    </div>
                  </div>

                  {/* SIP Calculator Interface */}
                  <div className="glass-card p-6 rounded-2xl text-left space-y-4">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-secondary flex items-center gap-2">
                      <span className="material-symbols-outlined">calculate</span>
                      SIP Projection
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] uppercase text-on-surface-variant mb-1 font-bold">Monthly Outlay (₹)</label>
                        <input
                          type="number"
                          value={monthlyInvest}
                          onChange={(e) => setMonthlyInvest(parseFloat(e.target.value) || 0)}
                          className="w-full bg-surface-container border border-subtle focus:border-primary px-3 py-2 rounded-lg text-xs text-on-surface font-mono outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase text-on-surface-variant mb-1 font-bold">Rate (% p.a.)</label>
                          <input
                            type="number"
                            value={expectedRate}
                            onChange={(e) => setExpectedRate(parseFloat(e.target.value) || 0)}
                            className="w-full bg-surface-container border border-subtle focus:border-primary px-3 py-2 rounded-lg text-xs text-on-surface font-mono outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase text-on-surface-variant mb-1 font-bold">Years</label>
                          <input
                            type="number"
                            value={horizonYears}
                            onChange={(e) => setHorizonYears(parseInt(e.target.value) || 1)}
                            className="w-full bg-surface-container border border-subtle focus:border-primary px-3 py-2 rounded-lg text-xs text-on-surface font-mono outline-none"
                          />
                        </div>
                      </div>

                      {/* Compound results */}
                      <div className="space-y-2.5 bg-surface-glass border border-subtle/50 p-4 rounded-xl text-xs">
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Capital Outlay:</span>
                          <span className="font-bold font-mono">{formatINR(sipResult.totalInvestment)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Accrued Gains:</span>
                          <span className="font-bold text-primary font-mono">{formatINR(sipResult.wealthGained)}</span>
                        </div>
                        <div className="border-t border-subtle/30 pt-2 flex justify-between">
                          <span className="font-bold text-on-surface">Total Valuation:</span>
                          <span className="font-bold text-secondary font-mono gold-glow">{formatINR(sipResult.totalWealth)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right Column: Allocations & Graphs */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Robo Allocations */}
                  <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-primary flex items-center gap-2">
                          <span className="material-symbols-outlined">pie_chart</span>
                          Robo-Allocations ({riskProfile})
                        </h3>
                        <span className="text-[9px] uppercase px-2 py-0.5 rounded font-bold bg-primary/10 text-primary">
                          Stable Allocation
                        </span>
                      </div>
                      
                      <div className="space-y-4 mt-4">
                        {currentAllocation.map((asset) => (
                          <div key={asset.name} className="space-y-1.5 border-b border-subtle/30 pb-3 last:border-0 last:pb-0">
                            <div className="flex justify-between text-xs">
                              <span className="font-bold text-on-surface">{asset.name}</span>
                              <span className="text-on-surface-variant font-mono font-semibold">
                                {asset.weight}% ({formatINR(asset.allocation)})
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-300 ${asset.color}`}
                                style={{ width: `${asset.weight}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-5 mt-5 border-t border-subtle/30 flex justify-end">
                      <Button 
                        variant="primary" 
                        onClick={handleSavePlan}
                        disabled={isSaving}
                      >
                        <span className="material-symbols-outlined text-[14px]">save</span>
                        {isSaving ? 'Saving strategy...' : 'Save Investment Plan'}
                      </Button>
                    </div>
                  </div>

                  {/* Yearly SIP Growth Area Chart */}
                  <div className="glass-card p-5 rounded-2xl">
                    <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4 text-left">
                      Compound SIP growth Projection (Principal vs Gains)
                    </h3>
                    <div className="h-60 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sipChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#e9c349" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#e9c349" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorGains" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#59de9b" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#59de9b" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="year" stroke="rgba(255,255,255,0.4)" fontSize={10} />
                          <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#161d19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px' }}
                            formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                          />
                          <Legend wrapperStyle={{ fontSize: '10px' }} />
                          <Area type="monotone" dataKey="Invested" stroke="#e9c349" fillOpacity={1} fill="url(#colorInvested)" />
                          <Area type="monotone" dataKey="Gains" stroke="#59de9b" fillOpacity={1} fill="url(#colorGains)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* 20-Year Timeline projection Line Chart */}
                  <div className="glass-card p-5 rounded-2xl">
                    <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4 text-left">
                      Long-Term Compound Portfolio timeline
                    </h3>
                    <div className="h-60 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={timelineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="year" stroke="rgba(255,255,255,0.4)" fontSize={10} />
                          <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#161d19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px' }}
                            formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                          />
                          <Legend wrapperStyle={{ fontSize: '10px' }} />
                          <Line type="monotone" dataKey="Portfolio" stroke="#59de9b" strokeWidth={2} activeDot={{ r: 4 }} />
                          <Line type="monotone" dataKey="Principal" stroke="#e9c349" strokeWidth={1} strokeDasharray="3 3" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>

              </div>

              {/* Saved Strategy Plans */}
              <div className="glass-card p-6 rounded-2xl animate-fade-in">
                <h3 className="font-bold text-sm mb-4 uppercase tracking-wider text-on-surface flex items-center gap-2 border-b border-subtle/30 pb-3">
                  <span className="material-symbols-outlined text-secondary">folder_special</span>
                  Saved Strategy Plans ({savedPlans.length})
                </h3>
                {savedPlans.length === 0 ? (
                  <p className="text-xs text-on-surface-variant/60 italic py-4">No investment strategies saved yet. Create a strategy above and save it.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {savedPlans.map((plan) => (
                      <div key={plan.id} className="p-4 rounded-xl border border-subtle/50 bg-surface-glass/40 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono text-on-surface-variant/70">
                            {new Date(plan.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <span className="text-[9px] uppercase px-2 py-0.5 rounded font-bold bg-secondary/15 text-secondary capitalize font-mono">
                            {plan.riskProfile} model
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline border-b border-subtle/30 pb-2">
                          <span className="text-xs text-on-surface font-semibold">Monthly Outlay Allocation:</span>
                          <span className="text-xs font-bold text-primary font-mono">{formatINR(plan.monthlyAmount)}</span>
                        </div>
                        <div className="space-y-1.5 pt-1">
                          {plan.allocation?.map((asset, idx) => (
                            <div key={idx} className="flex justify-between text-[10px] text-on-surface-variant">
                              <span>{asset.name} ({asset.weight}%)</span>
                              <span className="font-mono">{formatINR(asset.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </main>

      {/* Success/Error Toast notification overlay */}
      {toast && (
        <div className={`fixed bottom-5 right-5 px-5 py-3 rounded-xl border shadow-xl flex items-center gap-2 z-50 animate-fade-in ${
          toast.type === 'success' 
            ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300' 
            : 'bg-red-950/90 border-red-500/30 text-red-300'
        }`}>
          <span className="material-symbols-outlined text-base">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
