import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import Button from '../components/Button';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { databaseService } from '../services/databaseService';
import { useAuth } from '../hooks/useAuth';
import { formatINR } from '../utils/helpers';

export default function Expenses() {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState([]);
  
  // Form input states
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [editId, setEditId] = useState(null); // Triggers edit mode

  // Filter and total states
  const [filterCategory, setFilterCategory] = useState('All');
  const [loading, setLoading] = useState(false);

  const categories = ['Food', 'Shopping', 'Travel', 'Bills', 'Education', 'Health', 'Entertainment'];

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await databaseService.getExpenses(currentUser?.uid || 'demo_user');
      setExpenses(data);
    } catch (err) {
      console.error("Failed to load expenses ledger", err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      await Promise.resolve();
      if (active) {
        fetchExpenses();
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [fetchExpenses]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!desc || !amount || !date) return;

    setLoading(true);
    try {
      const payload = {
        description: desc,
        amount: parseFloat(amount),
        category,
        date,
        userId: currentUser?.uid || 'demo_user'
      };

      if (editId) {
        payload.id = editId;
      }

      await databaseService.saveExpense(payload, currentUser?.uid || 'demo_user');
      
      // Clean states
      setDesc('');
      setAmount('');
      setCategory('Food');
      setDate(new Date().toISOString().split('T')[0]);
      setEditId(null);
      
      await fetchExpenses();
    } catch (err) {
      console.error("Failed to save transaction", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (exp) => {
    setEditId(exp.id);
    setDesc(exp.description);
    setAmount(exp.amount.toString());
    setCategory(exp.category);
    setDate(exp.date);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await databaseService.deleteExpense(id);
      await fetchExpenses();
    } catch (err) {
      console.error("Failed to delete transaction", err);
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const filteredExpenses = filterCategory === 'All' 
    ? expenses 
    : expenses.filter(e => e.category === filterCategory);

  const currentMonthStr = new Date().toISOString().substring(0, 7); // "YYYY-MM"
  const monthlySpentTotal = expenses
    .filter(e => e.date.startsWith(currentMonthStr))
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Group by category for inline chart calculations
  const categoryChartData = categories.map(cat => {
    const total = expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0);
    return { name: cat, total };
  });

  const maxSpentInCategory = Math.max(...categoryChartData.map(c => c.total), 1);

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen">
      <Navbar />
      <Sidebar />
      
      <main className="lg:pl-64 pt-20">
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 text-left">
          
          {/* Header */}
          <div className="flex justify-between items-center border-b border-subtle pb-6">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Real-time Outflows</span>
              <h1 className="font-display-lg text-headline-lg font-bold">Smart Capital Expenses</h1>
            </div>
            <div className="text-right">
              <span className="text-[10px] block text-on-surface-variant font-bold">MONTHLY LEDGER TOTAL</span>
              <span className="font-display-lg text-headline-lg text-secondary font-bold gold-glow">
                {formatINR(monthlySpentTotal)}
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            <StatCard 
              title="Consolidated Outflow" 
              value={formatINR(expenses.reduce((a, b) => a + b.amount, 0))} 
              icon="payments"
              color="gold"
            />
            <StatCard 
              title="Current Month Total" 
              value={formatINR(monthlySpentTotal)} 
              icon="calendar_month"
              color="emerald"
            />
            <StatCard 
              title="Active Pools Utilized" 
              value={`${new Set(expenses.map(e => e.category)).size} Pools`} 
              icon="category"
              color="emerald"
            />
          </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Form Column */}
            <div className="glass-card p-6 rounded-2xl h-fit space-y-6">
              <h3 className="font-bold text-sm uppercase tracking-wider text-primary">
                {editId ? 'Modify Ledger Entry' : 'Log Capital Outflow'}
              </h3>
              
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-on-surface-variant mb-1 font-bold">Description</label>
                  <input
                    type="text"
                    required
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="E.g. Bloomberg subscription, office dinners..."
                    className="w-full bg-surface-container border-b border-subtle focus:border-primary px-3 py-2.5 rounded text-xs text-on-surface outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-on-surface-variant mb-1 font-bold">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-surface-container border border-subtle focus:border-primary px-3 py-2.5 rounded text-xs text-on-surface outline-none"
                    >
                      {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-on-surface-variant mb-1 font-bold">Amount (₹)</label>
                    <input
                      type="number"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="15000"
                      className="w-full bg-surface-container border-b border-subtle focus:border-primary px-3 py-2.5 rounded text-xs text-on-surface outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-on-surface-variant mb-1 font-bold">Date of Outflow</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-surface-container border border-subtle focus:border-primary px-3 py-2.5 rounded text-xs text-on-surface outline-none font-mono"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  {editId && (
                    <Button 
                      onClick={() => {
                        setEditId(null);
                        setDesc('');
                        setAmount('');
                        setCategory('Food');
                        setDate(new Date().toISOString().split('T')[0]);
                      }}
                      variant="outline" 
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  )}
                  <Button type="submit" variant="secondary" className="flex-1">
                    {editId ? 'Commit Changes' : 'Log Outflow'}
                  </Button>
                </div>
              </form>
            </div>

            {/* List Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Category Filter Controls */}
              <div className="glass-card p-4 rounded-xl flex items-center justify-between flex-wrap gap-3">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant">Ledger Filter Scope</span>
                <div className="flex gap-2 overflow-x-auto">
                  {['All', ...categories].map(c => (
                    <button
                      key={c}
                      onClick={() => setFilterCategory(c)}
                      className={`text-[10px] px-3 py-1.5 rounded-full border uppercase tracking-wider transition-all font-bold ${
                        filterCategory === c 
                          ? 'bg-primary/20 border-primary text-primary' 
                          : 'border-subtle hover:bg-surface-glass text-on-surface-variant'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Categories Visualizations (SVG lines) */}
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="font-bold text-xs uppercase tracking-wider text-primary mb-4">Outflow Allocation Pools</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {categoryChartData.map(c => {
                    const ratio = (c.total / maxSpentInCategory) * 100;
                    return (
                      <div key={c.name} className="space-y-1">
                        <span className="text-[10px] text-on-surface-variant block font-bold capitalize">{c.name}</span>
                        <span className="text-xs font-mono font-bold text-secondary">{formatINR(c.total)}</span>
                        <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-secondary rounded-full" 
                            style={{ width: `${ratio}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Transactions Ledger pipeline */}
              <div className="glass-card p-6 rounded-2xl animate-fade-in">
                <h3 className="font-bold text-xs uppercase tracking-wider text-on-surface-variant mb-4">Ledger pipelines</h3>
                
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12" />
                    <Skeleton className="h-12" />
                    <Skeleton className="h-12" />
                  </div>
                ) : filteredExpenses.length === 0 ? (
                  <EmptyState 
                    title="No Transactions Found" 
                    message="You have no recorded transaction offsets in this filter." 
                    icon="receipt_long" 
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-subtle text-on-surface-variant uppercase font-semibold">
                          <th className="py-3">Date</th>
                          <th className="py-3">Description</th>
                          <th className="py-3">Category</th>
                          <th className="py-3 text-right">Amount</th>
                          <th className="py-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-subtle">
                        {filteredExpenses.map((e) => (
                          <tr key={e.id} className="hover:bg-surface-glass transition-colors">
                            <td className="py-3 font-mono text-on-surface-variant">{e.date}</td>
                            <td className="py-3 font-bold text-on-surface">{e.description}</td>
                            <td className="py-3">
                              <span className="bg-surface-glass border border-subtle px-2 py-0.5 rounded text-[10px]">
                                {e.category}
                              </span>
                            </td>
                            <td className="py-3 text-right font-bold font-mono text-secondary">{formatINR(e.amount)}</td>
                            <td className="py-3 text-center flex justify-center gap-3">
                              <button 
                                onClick={() => handleEditClick(e)}
                                className="text-primary hover:text-primary-fixed-dim font-bold transition-colors"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDelete(e.id)}
                                className="text-red-400 hover:text-red-300 font-bold transition-colors"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
