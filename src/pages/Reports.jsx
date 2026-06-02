import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import Button from '../components/Button';
import Skeleton from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/helpers';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line
} from 'recharts';

const COLORS = ['#59de9b', '#e9c349', '#6366f1', '#8b5cf6', '#ec4899', '#3b82f6'];

const INITIAL_EXPENSES = [
  { id: '1', description: 'Institutional Dinner Banquet', category: 'Food', amount: 8500, date: '2026-06-01' },
  { id: '2', description: 'Venture Conference Travel', category: 'Travel', amount: 32000, date: '2026-05-28' },
  { id: '3', description: 'Bloomberg terminal premium subscription', category: 'Bills', amount: 18500, date: '2026-05-25' },
  { id: '4', description: 'Algorithmic Arbitrage Course', category: 'Education', amount: 15000, date: '2026-05-20' }
];

export default function Reports() {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // Strictly load data from localStorage to bypass direct Firebase connections
    const loadLocalData = () => {
      setIsLoading(true);
      try {
        const localExpenses = localStorage.getItem('finora_expenses');
        const localGoals = localStorage.getItem('finora_goals');
        
        setExpenses(localExpenses ? JSON.parse(localExpenses) : INITIAL_EXPENSES);
        setGoals(localGoals ? JSON.parse(localGoals) : []);
      } catch (err) {
        console.error("Error loading local reports data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadLocalData();
  }, [currentUser]);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    const element = document.getElementById('report-content');
    if (!element) return setIsDownloading(false);
    
    try {
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#0b0f0d',
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Finora-Wealth-Report.pdf');
    } catch (err) {
      console.error('Failed to generate PDF', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // 1. Dynamic Calculations
  const monthlyIncome = currentUser?.monthlyIncome || 150000;
  const totalLoggedExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const currentSavings = Math.max(0, monthlyIncome - totalLoggedExpenses);
  const savingsRate = monthlyIncome > 0 ? ((currentSavings / monthlyIncome) * 100).toFixed(1) : 0;

  // Top spending category
  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  let topCategory = 'N/A';
  let topCategoryAmount = 0;
  Object.entries(categoryTotals).forEach(([cat, amt]) => {
    if (amt > topCategoryAmount) {
      topCategoryAmount = amt;
      topCategory = cat;
    }
  });

  // Goal metrics
  const netWorthAUM = goals.reduce((acc, g) => acc + (g.current || 0), 0);
  const totalTargetGoals = goals.reduce((acc, g) => acc + (g.target || 0), 0);
  const avgGoalCompletion = totalTargetGoals > 0 ? (netWorthAUM / totalTargetGoals) * 100 : 0;

  // 2. Generate AI insights
  const generateAIInsights = () => {
    const insights = [];
    
    // Insight 1: Savings Rate
    if (parseFloat(savingsRate) >= 40) {
      insights.push({
        title: "Savings Velocity Strong",
        desc: `Your savings rate improved this month to ${savingsRate}%, outperforming the industry standard 40% benchmark.`,
        type: "success",
        icon: "trending_up"
      });
    } else {
      insights.push({
        title: "Capital Retention Leakage",
        desc: `Your savings rate is currently ${savingsRate}%. Rationalizing non-essential billing will help secure your target margin.`,
        type: "warning",
        icon: "warning"
      });
    }

    // Insight 2: Top Category
    if (topCategory !== 'N/A') {
      insights.push({
        title: "Outflow Concentration",
        desc: `${topCategory} is your highest expense category this month, totaling ${formatINR(topCategoryAmount)}.`,
        type: "info",
        icon: "shopping_bag"
      });
    }

    // Insight 3: Goal progress
    if (goals.length > 0) {
      insights.push({
        title: "Target Asset Matching",
        desc: `Average completion across your financial goals is ${avgGoalCompletion.toFixed(1)}%. Re-invest surplus margins.`,
        type: "success",
        icon: "track_changes"
      });
    }

    return insights;
  };
  const aiInsights = generateAIInsights();

  // 3. Chart Formatters
  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  const getMonthlyBarData = () => {
    const monthlyMap = {};
    expenses.forEach(e => {
      if (!e.date) return;
      const dateObj = new Date(e.date);
      const monthName = dateObj.toLocaleString('default', { month: 'short' });
      monthlyMap[monthName] = (monthlyMap[monthName] || 0) + e.amount;
    });

    const currentMonth = new Date().toLocaleString('default', { month: 'short' });
    if (Object.keys(monthlyMap).length === 0) {
      monthlyMap[currentMonth] = 0;
    }

    return Object.entries(monthlyMap).map(([month, exp]) => ({
      month,
      Income: monthlyIncome,
      Expense: exp
    }));
  };
  const barData = getMonthlyBarData();

  const lineData = barData.map(d => ({
    month: d.month,
    Savings: Math.max(0, d.Income - d.Expense)
  }));

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen">
      <Navbar />
      <Sidebar />
      
      <main className="lg:pl-64 pt-20">
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 text-left">
          
          {/* Header */}
          <div className="flex justify-between items-center border-b border-subtle pb-6 animate-fade-in">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Diagnostics Matrix</span>
              <h1 className="font-display-lg text-headline-lg font-bold">Wealth Audits & Asset Reports</h1>
            </div>
            <div className="text-right flex flex-col items-end gap-2">
              <span className="text-[10px] block text-on-surface-variant">PORTFOLIO YIELD SCORE</span>
              <span className="font-display-lg text-headline-lg text-secondary font-bold gold-glow">
                +14.8% YTD
              </span>
              <Button 
                variant="secondary" 
                className="text-[10px] py-1 px-3 mt-1 flex items-center gap-1"
                onClick={handleDownloadPDF}
                disabled={isDownloading || isLoading}
              >
                <span className="material-symbols-outlined text-[14px]">download</span>
                {isDownloading ? 'Generating...' : 'Download PDF'}
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
              <Skeleton className="h-64" />
            </div>
          ) : (
            <div id="report-content" className="space-y-8 bg-surface-container-lowest p-6 rounded-2xl border border-subtle/50">
              
              {/* Financial Summary Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <StatCard 
                  title="Income Base" 
                  value={formatINR(monthlyIncome)} 
                  icon="payments"
                  color="emerald"
                />
                <StatCard 
                  title="Total Expenses" 
                  value={formatINR(totalLoggedExpenses)} 
                  icon="shopping_bag"
                  color="gold"
                />
                <StatCard 
                  title="Net Savings" 
                  value={formatINR(currentSavings)} 
                  icon="savings"
                  color="emerald"
                />
                <StatCard 
                  title="Savings Margin" 
                  value={`${savingsRate}%`} 
                  change={parseFloat(savingsRate) >= 40 ? "Healthy" : "Below target"}
                  isPositive={parseFloat(savingsRate) >= 40}
                  icon="percent"
                  color="emerald"
                />
              </div>

              {/* Dynamic Calculations Panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Executive Audit Overview */}
                <div className="glass-card p-6 rounded-2xl text-left">
                  <h3 className="font-bold text-sm mb-4 uppercase tracking-wider text-primary">Executive Summary</h3>
                  <div className="space-y-4">
                    <div className="py-2.5 flex justify-between items-center border-b border-subtle last:border-0">
                      <div>
                        <p className="text-xs font-bold text-on-surface">Annualized Income Base</p>
                        <span className="text-[9px] text-on-surface-variant font-mono">Based on profile entries</span>
                      </div>
                      <p className="text-xs font-bold text-on-surface font-mono">{formatINR(monthlyIncome * 12)}</p>
                    </div>

                    <div className="py-2.5 flex justify-between items-center border-b border-subtle last:border-0">
                      <div>
                        <p className="text-xs font-bold text-on-surface">Consolidated Outflow</p>
                        <span className="text-[9px] text-on-surface-variant font-mono">All logged transactions</span>
                      </div>
                      <p className="text-xs font-bold text-secondary font-mono">({formatINR(totalLoggedExpenses)})</p>
                    </div>

                    <div className="py-2.5 flex justify-between items-center border-b border-subtle last:border-0">
                      <div>
                        <p className="text-xs font-bold text-on-surface">Top Spending Category</p>
                        <span className="text-[9px] text-on-surface-variant font-mono">Maximum allocation pool</span>
                      </div>
                      <p className="text-xs font-bold text-on-surface font-mono">{topCategory} ({formatINR(topCategoryAmount)})</p>
                    </div>

                    <div className="py-2.5 flex justify-between items-center border-b border-subtle last:border-0">
                      <div>
                        <p className="text-xs font-bold text-on-surface">Savings Margin Rate</p>
                        <span className="text-[9px] text-on-surface-variant font-mono">Efficiency target</span>
                      </div>
                      <p className="text-xs font-bold text-primary font-mono">{savingsRate}%</p>
                    </div>
                  </div>
                </div>

                {/* AI Monthly Insights Section */}
                <div className="glass-card p-6 rounded-2xl text-left flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm mb-4 uppercase tracking-wider text-secondary flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary">psychology</span>
                      AI Monthly Insights
                    </h3>
                    
                    <div className="space-y-4">
                      {aiInsights.map((insight, idx) => (
                        <div 
                          key={idx} 
                          className={`p-4 border rounded-xl flex items-start gap-3 ${
                            insight.type === 'warning' 
                              ? 'bg-red-950/20 border-red-500/20' 
                              : insight.type === 'info' 
                              ? 'bg-secondary-container/10 border-secondary/20' 
                              : 'bg-primary-container/10 border-primary/20'
                          }`}
                        >
                          <span className={`material-symbols-outlined text-sm mt-0.5 ${
                            insight.type === 'warning' ? 'text-red-400' : insight.type === 'info' ? 'text-secondary' : 'text-primary'
                          }`}>
                            {insight.icon}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-on-surface">{insight.title}</p>
                            <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">{insight.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Recharts Displays */}
              <div className="space-y-6">
                
                {/* 1. Expense Category Allocation Pie Chart */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-card p-5 rounded-2xl flex flex-col items-center">
                    <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4 w-full text-left">
                      Expense Category Allocation
                    </h3>
                    <div className="h-60 w-full flex items-center justify-center">
                      {pieData.length === 0 ? (
                        <p className="text-xs text-on-surface-variant italic">No data recorded.</p>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#161d19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px' }}
                              labelStyle={{ color: '#fff' }}
                              itemStyle={{ color: '#a3a3a3' }}
                              formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* 2. Income vs Expense Bar Chart */}
                  <div className="glass-card p-5 rounded-2xl">
                    <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4 text-left">
                      Inflows vs Outflows comparison
                    </h3>
                    <div className="h-60 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={10} />
                          <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#161d19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px' }}
                            formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                          />
                          <Legend wrapperStyle={{ fontSize: '10px' }} />
                          <Bar dataKey="Income" fill="#59de9b" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Expense" fill="#e9c349" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* 3. Monthly savings trend Line Chart */}
                <div className="glass-card p-5 rounded-2xl">
                  <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4 text-left">
                    Monthly Liquidity Margin (Savings) Trend
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={lineData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={10} />
                        <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#161d19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px' }}
                          formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                        />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                        <Line type="monotone" dataKey="Savings" stroke="#59de9b" strokeWidth={2.5} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
