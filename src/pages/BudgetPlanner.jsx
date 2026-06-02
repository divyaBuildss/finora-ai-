import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import Button from '../components/Button';
import { databaseService } from '../services/databaseService';
import { useAuth } from '../hooks/useAuth';
import { formatINR } from '../utils/helpers';

export default function BudgetPlanner() {
  const { currentUser } = useAuth();
  
  // Data states
  const [expenses, setExpenses] = useState([]);
  const [customThresholds, setCustomThresholds] = useState(null);
  
  // Custom adjustments
  const [adjustRule, setAdjustRule] = useState('');
  const [adjustAmt, setAdjustAmt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch actual data
  useEffect(() => {
    const fetchBudgetAssets = async () => {
      try {
        const data = await databaseService.getExpenses(currentUser?.uid || 'demo_user');
        setExpenses(data);
        
        // Load custom adjustments from databaseService
        const savedCustom = await databaseService.fetchBudgets(currentUser?.uid || 'demo_user');
        if (savedCustom) {
          setCustomThresholds(savedCustom);
        }
      } catch (err) {
        console.error("Failed to load budgets dashboard", err);
      }
    };
    fetchBudgetAssets();
  }, [currentUser]);

  // Income diagnostics
  const income = currentUser?.monthlyIncome || 150000;

  // 50/30/20 Standard Rule limits
  const baseNeedsLimit = income * 0.50;
  const baseWantsLimit = income * 0.30;
  const baseSavingsLimit = income * 0.20;

  // Custom boundaries if modified
  const hasOverride = !!customThresholds?.hasCustomOverride;
  const needsLimit = hasOverride && customThresholds?.needs !== undefined ? customThresholds.needs : baseNeedsLimit;
  const wantsLimit = hasOverride && customThresholds?.wants !== undefined ? customThresholds.wants : baseWantsLimit;
  const savingsLimit = hasOverride && customThresholds?.savings !== undefined ? customThresholds.savings : baseSavingsLimit;

  // Calculate actual spending parameters from expenses
  // Needs: Bills, Health, Education
  const needsSpent = expenses
    .filter(e => ['Bills', 'Health', 'Education'].includes(e.category))
    .reduce((sum, e) => sum + e.amount, 0);

  // Wants: Food, Shopping, Travel, Entertainment
  const wantsSpent = expenses
    .filter(e => ['Food', 'Shopping', 'Travel', 'Entertainment'].includes(e.category))
    .reduce((sum, e) => sum + e.amount, 0);

  // Savings accrued: Inflow - Outflows
  const totalSpent = needsSpent + wantsSpent;
  const actualSavings = Math.max(income - totalSpent, 0);

  // Exceeded / Under limits calculations
  const needsRatio = (needsSpent / needsLimit) * 100;
  const wantsRatio = (wantsSpent / wantsLimit) * 100;
  const savingsRatio = savingsLimit > 0 ? (actualSavings / savingsLimit) * 100 : 100;

  // Save budget adjustments to Firebase/localStorage
  const handleAdjustRule = async (e) => {
    e.preventDefault();
    if (!adjustRule || !adjustAmt) return;

    setError('');
    setLoading(true);
    try {
      const amtVal = parseFloat(adjustAmt) || 0;

      // Prevent budget limits below current spending from being accidentally saved without warning
      if (adjustRule === 'needs' && amtVal < needsSpent) {
        const proceed = window.confirm(`Warning: The proposed Needs limit (₹${amtVal}) is below your current Needs spending (₹${needsSpent}). Do you want to save anyway?`);
        if (!proceed) {
          setLoading(false);
          return;
        }
      }
      if (adjustRule === 'wants' && amtVal < wantsSpent) {
        const proceed = window.confirm(`Warning: The proposed Wants limit (₹${amtVal}) is below your current Wants spending (₹${wantsSpent}). Do you want to save anyway?`);
        if (!proceed) {
          setLoading(false);
          return;
        }
      }

      const updated = {
        needs: hasOverride && customThresholds?.needs !== undefined ? customThresholds.needs : baseNeedsLimit,
        wants: hasOverride && customThresholds?.wants !== undefined ? customThresholds.wants : baseWantsLimit,
        savings: hasOverride && customThresholds?.savings !== undefined ? customThresholds.savings : baseSavingsLimit,
        [adjustRule]: amtVal,
        hasCustomOverride: true
      };

      setCustomThresholds(updated);
      await databaseService.saveBudgets(updated, currentUser?.uid || 'demo_user');

      setAdjustRule('');
      setAdjustAmt('');
    } catch (err) {
      console.error("Failed to sync budget changes:", err);
      setError('Failed to sync budget changes.');
    } finally {
      setLoading(false);
    }
  };


  // Compile AI Recommendations
  const getAIRecommendations = () => {
    const recs = [];
    
    // Check specific food overspending if category exists
    const foodSpent = expenses.filter(e => e.category === 'Food').reduce((a, b) => a + b.amount, 0);
    if (foodSpent > 15000) {
      recs.push({
        title: "Discretionary Alert",
        desc: `You exceeded standard Food budget thresholds by ${formatINR(Math.abs(foodSpent - 12000))}. Consider home cooking to save capital.`,
        type: "warning"
      });
    }

    if (needsRatio > 100) {
      recs.push({
        title: "Needs Overrun Detected",
        desc: `Fixed overhead bills exceeded allocations by ${formatINR(needsSpent - needsLimit)}. Terminate unnecessary utility bounds.`,
        type: "danger"
      });
    } else {
      recs.push({
        title: "Essential Guardrail intact",
        desc: "Essential overhead pipeline allocation remains within safe limits. Capital structure is solid.",
        type: "success"
      });
    }

    if (wantsRatio > 100) {
      recs.push({
        title: "Wants Allocation Overrun",
        desc: `Wants budget pool exceeded limit by ${formatINR(wantsSpent - wantsLimit)}. Shift discretionary allocations into savings.`,
        type: "danger"
      });
    } else if (wantsRatio > 80) {
      recs.push({
        title: "Wants Capacity Approaching",
        desc: "Wants allocation is approaching its capacity threshold. Reduce non-essential shopping this month.",
        type: "warning"
      });
    }

    return recs;
  };

  const recommendations = getAIRecommendations();

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
              <h1 className="font-display-lg text-headline-lg font-bold">50/30/20 AI Budget Mandate</h1>
            </div>
            <div className="text-right">
              <span className="text-[10px] block text-on-surface-variant font-bold">EST. CAPITAL INCOME BASE</span>
              <span className="font-display-lg text-headline-lg text-primary font-bold emerald-glow">
                {formatINR(income)}
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            <StatCard 
              title="Needs Limit (50%)" 
              value={formatINR(needsLimit)} 
              change={`Spent: ${formatINR(needsSpent)}`}
              isPositive={needsSpent <= needsLimit}
              icon="house"
              color="emerald"
            />
            <StatCard 
              title="Wants Limit (30%)" 
              value={formatINR(wantsLimit)} 
              change={`Spent: ${formatINR(wantsSpent)}`}
              isPositive={wantsSpent <= wantsLimit}
              icon="wine_bar"
              color="gold"
            />
            <StatCard 
              title="Savings Target (20%)" 
              value={formatINR(savingsLimit)} 
              change={`Actual: ${formatINR(actualSavings)}`}
              isPositive={actualSavings >= savingsLimit}
              icon="savings"
              color="emerald"
            />
          </div>

          {error && (
            <div className="bg-red-950/40 border border-red-500/30 text-red-300 p-3 rounded-lg text-xs text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Custom Rules Setup Form */}
            <div className="glass-card p-6 rounded-2xl h-fit space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-secondary">Override Rule Allocations</h3>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Adjust standard limits. Shifts are synced securely back to your Firestore mandate.
              </p>
              
              <form onSubmit={handleAdjustRule} className="space-y-4 pt-2">
                <div>
                  <label className="block text-[10px] uppercase text-on-surface-variant mb-1 font-bold">Select Allocation Pool</label>
                  <select
                    value={adjustRule}
                    onChange={(e) => setAdjustRule(e.target.value)}
                    className="w-full bg-surface-container border border-subtle focus:border-primary px-3 py-2.5 rounded text-xs text-on-surface outline-none"
                    required
                  >
                    <option value="">-- Choose Category --</option>
                    <option value="needs">Needs (50%)</option>
                    <option value="wants">Wants (30%)</option>
                    <option value="savings">Savings (20%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-on-surface-variant mb-1 font-bold">Revised Target Value (₹)</label>
                  <input
                    type="number"
                    required
                    value={adjustAmt}
                    onChange={(e) => setAdjustAmt(e.target.value)}
                    placeholder="E.g. 70000"
                    className="w-full bg-surface-container border-b border-subtle focus:border-primary px-3 py-2.5 rounded text-xs text-on-surface outline-none font-mono"
                  />
                </div>

                <Button type="submit" variant="secondary" className="w-full">
                  {loading ? 'Syncing...' : 'Override Limit'}
                </Button>
              </form>
            </div>

            {/* Progress Meters Column */}
            <div className="lg:col-span-2 glass-card p-6 rounded-2xl space-y-6 animate-fade-in">
              <h3 className="font-bold text-sm uppercase tracking-wider text-on-surface-variant">50/30/20 Rule Meters</h3>
              
              {/* Needs (50%) */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-on-surface">Needs (Essential Bills, Education, Health)</span>
                  <span className="text-primary font-mono">{needsRatio.toFixed(0)}% Utilized</span>
                </div>
                <div className="w-full h-3.5 bg-surface-container rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      needsRatio > 100 ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-gradient-to-r from-primary to-primary-fixed-dim'
                    }`}
                    style={{ width: `${Math.min(needsRatio, 100)}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-on-surface-variant block">Spent {formatINR(needsSpent)} of {formatINR(needsLimit)}</span>
              </div>

              {/* Wants (30%) */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-on-surface">Wants (Food, Shopping, Travel, Entertainment)</span>
                  <span className="text-secondary font-mono">{wantsRatio.toFixed(0)}% Utilized</span>
                </div>
                <div className="w-full h-3.5 bg-surface-container rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      wantsRatio > 100 ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-gradient-to-r from-secondary to-secondary-fixed'
                    }`}
                    style={{ width: `${Math.min(wantsRatio, 100)}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-on-surface-variant block">Spent {formatINR(wantsSpent)} of {formatINR(wantsLimit)}</span>
              </div>

              {/* Savings (20%) */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-on-surface">Savings (Accrued Capital Reserves)</span>
                  <span className="text-primary font-mono">{savingsRatio.toFixed(0)}% Met</span>
                </div>
                <div className="w-full h-3.5 bg-surface-container rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      savingsRatio < 100 ? 'bg-gradient-to-r from-secondary to-secondary-fixed' : 'bg-gradient-to-r from-primary to-primary-fixed-dim'
                    }`}
                    style={{ width: `${Math.min(savingsRatio, 100)}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-on-surface-variant block">Accrued {formatINR(actualSavings)} vs target of {formatINR(savingsLimit)}</span>
              </div>

            </div>

          </div>

          {/* AI recommendations row */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="font-bold text-sm mb-6 uppercase tracking-wider text-secondary flex items-center gap-2">
              <span className="material-symbols-outlined animate-pulse text-secondary">psychology</span>
              AI Advisor Mandate Warnings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendations.map((rec, idx) => (
                <div 
                  key={idx} 
                  className={`p-5 rounded-xl border text-left space-y-2 ${
                    rec.type === 'danger' 
                      ? 'bg-red-950/20 border-red-500/20' 
                      : rec.type === 'warning' 
                      ? 'bg-secondary-container/10 border-secondary/20' 
                      : 'bg-primary-container/10 border-primary/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-sm ${
                      rec.type === 'danger' ? 'text-red-400' : rec.type === 'warning' ? 'text-secondary' : 'text-primary'
                    }`}>
                      {rec.type === 'danger' ? 'error' : rec.type === 'warning' ? 'warning' : 'check_circle'}
                    </span>
                    <span className="font-bold text-xs text-on-surface">{rec.title}</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    {rec.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
