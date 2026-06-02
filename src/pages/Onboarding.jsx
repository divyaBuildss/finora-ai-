import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Button from '../components/Button';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const { updateOnboardingStatus } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [age, setAge] = useState('');
  const [occupation, setOccupation] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [monthlyExpenses, setMonthlyExpenses] = useState('');
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [riskProfile, setRiskProfile] = useState('balanced');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const goalsOptions = [
    { id: 'save_money', label: 'Save Money', desc: 'Secure liquid capital overrides.', icon: 'savings' },
    { id: 'invest', label: 'Invest', desc: 'Build alpha equities pipelines.', icon: 'trending_up' },
    { id: 'buy_house', label: 'Buy House', desc: 'Acquire real-estate assets.', icon: 'home' },
    { id: 'buy_vehicle', label: 'Buy Vehicle', desc: 'Secure transportation leverage.', icon: 'directions_car' },
    { id: 'education', label: 'Education', desc: 'Finance cognitive growth parameters.', icon: 'school' },
    { id: 'travel', label: 'Travel', desc: 'Fund global network scope operations.', icon: 'flight' }
  ];

  const handleGoalToggle = (id) => {
    setSelectedGoals(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const handleComplete = async () => {
    setError('');
    setLoading(true);
    try {
      await updateOnboardingStatus(true, {
        age: parseInt(age) || 0,
        occupation,
        monthlyIncome: parseFloat(monthlyIncome) || 0,
        monthlyExpenses: parseFloat(monthlyExpenses) || 0,
        goals: selectedGoals,
        riskProfile
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to save financial mandate setup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen">
      <Navbar />
      
      <main className="pt-32 pb-16 flex items-center justify-center px-4 hero-gradient">
        <div className="w-full max-w-2xl glass-card rounded-3xl p-8 md:p-12 relative z-10 text-left animate-slide-up">
          
          {/* Step Indicator */}
          <div className="flex justify-between items-center mb-8 border-b border-subtle pb-6">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Personalization Engine</span>
              <h2 className="font-display-lg text-headline-lg font-bold">Configure Your Mandate</h2>
            </div>
            <div className="text-right">
              <span className="text-xs text-on-surface-variant font-mono">STEP {step} OF 4</span>
              <div className="w-24 h-1.5 bg-surface-container rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${(step / 4) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-950/40 border border-red-500/30 text-red-300 p-3 rounded-lg text-xs mb-6 text-center">
              {error}
            </div>
          )}

          {/* STEP 1: Personal (Age, Occupation) */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="font-headline-lg text-body-lg font-bold">Step 1: Personal Diagnostics</h3>
              <p className="text-xs text-on-surface-variant">Tell us about yourself to tailor risk metrics dynamically.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-on-surface-variant mb-2">Age</label>
                  <input
                    type="number"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="E.g. 28"
                    className="w-full bg-surface-container border-b border-subtle focus:border-primary px-4 py-3 rounded-lg text-on-surface outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-on-surface-variant mb-2">Occupation / Mandate</label>
                  <input
                    type="text"
                    required
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="E.g. Full-Stack Developer, Venture Capitalist"
                    className="w-full bg-surface-container border-b-2 border-subtle focus:border-primary px-4 py-3 rounded-lg text-on-surface outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Income (Monthly Income, Monthly Expenses) */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="font-headline-lg text-body-lg font-bold">Step 2: Capital Inflows & Outflows</h3>
              <p className="text-xs text-on-surface-variant">Identify monthly capital liquidity bounds.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-on-surface-variant mb-2">Est. Monthly Inflow / Income (₹)</label>
                  <input
                    type="number"
                    required
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    placeholder="E.g. 150000"
                    className="w-full bg-surface-container border-b-2 border-subtle focus:border-primary px-4 py-3 rounded-lg text-on-surface outline-none transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-on-surface-variant mb-2">Est. Monthly Outflow / Expenses (₹)</label>
                  <input
                    type="number"
                    required
                    value={monthlyExpenses}
                    onChange={(e) => setMonthlyExpenses(e.target.value)}
                    placeholder="E.g. 60000"
                    className="w-full bg-surface-container border-b-2 border-subtle focus:border-primary px-4 py-3 rounded-lg text-on-surface outline-none transition-all font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Goals */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="font-headline-lg text-body-lg font-bold">Step 3: Wealth Targets</h3>
              <p className="text-xs text-on-surface-variant">Select targets to optimize portfolio calculations. (Select all that apply)</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goalsOptions.map((g) => {
                  const isSelected = selectedGoals.includes(g.id);
                  return (
                    <div
                      key={g.id}
                      onClick={() => handleGoalToggle(g.id)}
                      className={`glass-card p-6 rounded-xl cursor-pointer transition-all flex items-start gap-4 border ${
                        isSelected 
                          ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5' 
                          : 'border-subtle hover:border-primary/50'
                      }`}
                    >
                      <span className={`material-symbols-outlined p-3 rounded-lg ${
                        isSelected ? 'bg-primary/20 text-primary' : 'bg-surface-glass text-on-surface-variant'
                      }`}>
                        {g.icon}
                      </span>
                      <div>
                        <p className="font-bold text-sm text-on-surface">{g.label}</p>
                        <p className="text-xs text-on-surface-variant mt-1">{g.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Risk Profile */}
          {step === 4 && (
            <div className="space-y-6">
              <h3 className="font-headline-lg text-body-lg font-bold">Step 4: Risk Management Boundary</h3>
              <p className="text-xs text-on-surface-variant">Select a volatility tolerance pool below.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'conservative', title: 'Conservative', desc: 'Max drawdown < 5%. Focuses on capital preservation.', icon: 'security' },
                  { id: 'balanced', title: 'Balanced', desc: 'Drawdown < 15%. Focuses on steady capital growth.', icon: 'balance' },
                  { id: 'aggressive', title: 'Aggressive', desc: 'Accepts volatility for maximum equity alpha.', icon: 'bolt' }
                ].map((level) => (
                  <div
                    key={level.id}
                    onClick={() => setRiskProfile(level.id)}
                    className={`glass-card p-6 rounded-xl cursor-pointer transition-all border text-center ${
                      riskProfile === level.id 
                        ? 'border-secondary bg-secondary/5 shadow-lg shadow-secondary/5' 
                        : 'border-subtle hover:border-secondary/50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-4xl block mb-3 text-secondary">
                      {level.icon}
                    </span>
                    <p className="font-bold text-sm">{level.title}</p>
                    <span className="text-[10px] text-on-surface-variant block mt-2 leading-relaxed">
                      {level.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex justify-between items-center mt-12 pt-6 border-t border-subtle">
            {step > 1 ? (
              <Button onClick={() => setStep(step - 1)} variant="outline">
                Back
              </Button>
            ) : (
              <div></div>
            )}

            {step < 4 ? (
              <Button 
                onClick={() => {
                  // Basic step validation
                  if (step === 1 && (!age || !occupation)) {
                    return setError('Age and occupation are required.');
                  }
                  if (step === 2 && (!monthlyIncome || !monthlyExpenses)) {
                    return setError('Income parameters are required.');
                  }
                  setError('');
                  setStep(step + 1);
                }} 
                variant="primary"
              >
                Proceed
              </Button>
            ) : (
              <Button 
                onClick={handleComplete} 
                variant="secondary"
                className="flex items-center justify-center min-w-[180px]"
              >
                {loading ? (
                  <span className="animate-pulse">Building Portfolio...</span>
                ) : (
                  'Complete Setup'
                )}
              </Button>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
