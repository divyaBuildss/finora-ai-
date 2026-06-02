import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';
import Skeleton from '../components/Skeleton';

const GOALS_OPTIONS = [
  { id: 'save_money', label: 'Save Money', desc: 'Secure liquid capital overrides.', icon: 'savings' },
  { id: 'invest', label: 'Invest', desc: 'Build alpha equities pipelines.', icon: 'trending_up' },
  { id: 'buy_house', label: 'Buy House', desc: 'Acquire real-estate assets.', icon: 'home' },
  { id: 'buy_vehicle', label: 'Buy Vehicle', desc: 'Secure transportation leverage.', icon: 'directions_car' },
  { id: 'education', label: 'Education', desc: 'Finance cognitive growth parameters.', icon: 'school' },
  { id: 'travel', label: 'Travel', desc: 'Fund global network scope operations.', icon: 'flight' }
];

export default function Profile() {
  const { currentUser, updateOnboardingStatus, logout } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState(null);

  // Profile data state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    age: '',
    occupation: '',
    monthlyIncome: '',
    monthlyExpenses: '',
    riskProfile: 'balanced',
    goals: []
  });

  // Backup for canceling edits
  const [editedData, setEditedData] = useState({ ...profileData });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchUserData = () => {
      if (!currentUser) return;
      setIsLoading(true);
      try {
        // Retrieve profile details strictly from localStorage demo storage
        const localUser = localStorage.getItem('finora_user');
        if (localUser) {
          const parsed = JSON.parse(localUser);
          const mergedData = {
            name: parsed.name || currentUser.name || '',
            email: parsed.email || currentUser.email || '',
            age: parsed.age || '',
            occupation: parsed.occupation || '',
            monthlyIncome: parsed.monthlyIncome || '',
            monthlyExpenses: parsed.monthlyExpenses || '',
            riskProfile: parsed.riskProfile || 'balanced',
            goals: parsed.goals || []
          };
          setProfileData(mergedData);
          setEditedData(mergedData);
        } else {
          // Fallback to current context variables
          const defaultData = {
            name: currentUser.name || '',
            email: currentUser.email || '',
            age: currentUser.age || '',
            occupation: currentUser.occupation || '',
            monthlyIncome: currentUser.monthlyIncome || '',
            monthlyExpenses: currentUser.monthlyExpenses || '',
            riskProfile: currentUser.riskProfile || 'balanced',
            goals: currentUser.goals || []
          };
          setProfileData(defaultData);
          setEditedData(defaultData);
        }
      } catch (err) {
        console.error("Error fetching local user data:", err);
        showToast("Error loading profile data", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleEdit = () => {
    setEditedData({ ...profileData });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedData({ ...profileData });
    setIsEditing(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    // Form validation rules
    if (!editedData.name.trim()) {
      showToast("Full name is required", "error");
      return;
    }
    const ageVal = parseInt(editedData.age);
    if (isNaN(ageVal) || ageVal < 18 || ageVal > 120) {
      showToast("Please enter a valid age between 18 and 120", "error");
      return;
    }
    if (!editedData.occupation.trim()) {
      showToast("Occupation mandate is required", "error");
      return;
    }
    const incomeVal = parseFloat(editedData.monthlyIncome);
    if (isNaN(incomeVal) || incomeVal < 0) {
      showToast("Monthly income must be a positive number", "error");
      return;
    }
    const expensesVal = parseFloat(editedData.monthlyExpenses);
    if (isNaN(expensesVal) || expensesVal < 0) {
      showToast("Monthly expenses must be a positive number", "error");
      return;
    }

    setIsSaving(true);
    try {
      const updatedMandate = {
        ...currentUser,
        name: editedData.name,
        age: ageVal,
        occupation: editedData.occupation,
        monthlyIncome: incomeVal,
        monthlyExpenses: expensesVal,
        goals: editedData.goals,
        riskProfile: editedData.riskProfile
      };

      // Persist changes to localStorage demo storage
      localStorage.setItem('finora_user', JSON.stringify(updatedMandate));

      // Sync changes back to local AuthContext state
      await updateOnboardingStatus(true, {
        name: editedData.name,
        age: ageVal,
        occupation: editedData.occupation,
        monthlyIncome: incomeVal,
        monthlyExpenses: expensesVal,
        goals: editedData.goals,
        riskProfile: editedData.riskProfile
      });

      setProfileData({ ...editedData });
      setIsEditing(false);
      showToast("Profile mandate saved locally", "success");
    } catch (err) {
      console.error("Error saving profile details:", err);
      showToast("Failed to update profile", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error("Logout failed:", err);
      showToast("Logout operation failed", "error");
    }
  };

  const handleGoalToggle = (goalId) => {
    setEditedData(prev => {
      const isSelected = prev.goals.includes(goalId);
      const updatedGoals = isSelected 
        ? prev.goals.filter(g => g !== goalId) 
        : [...prev.goals, goalId];
      return { ...prev, goals: updatedGoals };
    });
  };

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen">
      <Navbar />
      <Sidebar />
      
      <main className="lg:pl-64 pt-20">
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 text-left">
          
          {/* Header */}
          <div className="flex justify-between items-center border-b border-subtle pb-6">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Client Settings</span>
              <h1 className="font-display-lg text-headline-lg font-bold">Profile Mandate</h1>
            </div>
            <div>
              <span className="text-xs text-on-surface-variant font-mono uppercase bg-surface-glass border border-subtle px-3 py-1 rounded">
                SECURE INST. ACCESS
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left Side: Avatar/Security */}
            <div className="glass-card p-6 rounded-2xl text-center space-y-4 flex flex-col justify-between h-fit">
              <div className="space-y-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-secondary mx-auto flex items-center justify-center shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined text-[48px] text-on-primary">
                    account_balance_wallet
                  </span>
                </div>
                {isLoading ? (
                  <div className="space-y-2 flex flex-col items-center">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                ) : (
                  <div>
                    <h3 className="font-bold text-sm text-on-surface">
                      {profileData.name.toUpperCase() || currentUser?.email?.split('@')[0].toUpperCase()}
                    </h3>
                    <span className="text-[10px] text-on-surface-variant uppercase font-mono block mt-1">Client ID: {currentUser?.uid || 'sim-client'}</span>
                  </div>
                )}

                <div className="border-t border-subtle/50 pt-4 flex flex-col gap-2">
                  <span className="text-[10px] uppercase text-primary font-bold">Account Security</span>
                  <span className="text-xs text-on-surface-variant">AES-256 Keys Configured</span>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center justify-center gap-1">
                    <span className="live-dot bg-emerald-400"></span> Local Safe Storage
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-subtle/30">
                <Button variant="danger" className="w-full justify-center" onClick={handleLogout}>
                  <span className="material-symbols-outlined text-sm">logout</span>
                  Logout
                </Button>
              </div>
            </div>

            {/* Right Side: Settings Forms */}
            <div className="col-span-1 md:col-span-2 glass-card p-6 rounded-2xl space-y-6">
              <div className="flex justify-between items-center border-b border-subtle/30 pb-3">
                <h3 className="font-bold text-sm uppercase tracking-wider text-primary">Registration Metadata</h3>
                <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-bold ${isEditing ? 'bg-secondary/15 text-secondary' : 'bg-primary/10 text-primary'}`}>
                  {isEditing ? 'Edit Mode' : 'View Mode'}
                </span>
              </div>
              
              {isLoading ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, idx) => (
                      <div key={idx} className="space-y-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-9 w-full" />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSave} className="space-y-6">
                  {/* Personal Section */}
                  <div>
                    <span className="text-[10px] text-secondary font-bold uppercase tracking-wider block mb-4">Personal Profile</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                      <div>
                        <label className="text-on-surface-variant uppercase block font-bold mb-1.5">Full Name</label>
                        {isEditing ? (
                          <input
                            type="text"
                            required
                            value={editedData.name}
                            onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                            className="w-full bg-surface-container border border-subtle focus:border-primary px-3 py-2 rounded-lg text-xs text-on-surface outline-none transition-all"
                          />
                        ) : (
                          <span className="text-on-surface font-semibold bg-surface-glass border border-subtle px-3 py-2 rounded-lg block">
                            {profileData.name || 'N/A'}
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="text-on-surface-variant uppercase block font-bold mb-1.5">Institutional Email</label>
                        <input
                          type="email"
                          disabled
                          value={profileData.email}
                          className="w-full bg-surface-container/40 border border-subtle/50 px-3 py-2 rounded-lg text-xs text-on-surface-variant font-mono outline-none cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label className="text-on-surface-variant uppercase block font-bold mb-1.5">Client Age</label>
                        {isEditing ? (
                          <input
                            type="number"
                            required
                            value={editedData.age}
                            onChange={(e) => setEditedData({ ...editedData, age: e.target.value })}
                            className="w-full bg-surface-container border border-subtle focus:border-primary px-3 py-2 rounded-lg text-xs text-on-surface outline-none transition-all"
                          />
                        ) : (
                          <span className="text-on-surface font-semibold bg-surface-glass border border-subtle px-3 py-2 rounded-lg block">
                            {profileData.age || 'N/A'} Years
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="text-on-surface-variant uppercase block font-bold mb-1.5">Occupation / Mandate</label>
                        {isEditing ? (
                          <input
                            type="text"
                            required
                            value={editedData.occupation}
                            onChange={(e) => setEditedData({ ...editedData, occupation: e.target.value })}
                            className="w-full bg-surface-container border border-subtle focus:border-primary px-3 py-2 rounded-lg text-xs text-on-surface outline-none transition-all"
                          />
                        ) : (
                          <span className="text-on-surface font-semibold bg-surface-glass border border-subtle px-3 py-2 rounded-lg block">
                            {profileData.occupation || 'N/A'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Financial Section */}
                  <div className="border-t border-subtle/30 pt-6">
                    <span className="text-[10px] text-secondary font-bold uppercase tracking-wider block mb-4">Financial Metadata</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs mb-6">
                      <div>
                        <label className="text-on-surface-variant uppercase block font-bold mb-1.5">Monthly Income (₹)</label>
                        {isEditing ? (
                          <input
                            type="number"
                            required
                            value={editedData.monthlyIncome}
                            onChange={(e) => setEditedData({ ...editedData, monthlyIncome: e.target.value })}
                            className="w-full bg-surface-container border border-subtle focus:border-primary px-3 py-2 rounded-lg text-xs text-on-surface outline-none transition-all font-mono"
                          />
                        ) : (
                          <span className="text-on-surface font-semibold bg-surface-glass border border-subtle px-3 py-2 rounded-lg block font-mono">
                            ₹{(Number(profileData.monthlyIncome) || 0).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="text-on-surface-variant uppercase block font-bold mb-1.5">Monthly Expenses (₹)</label>
                        {isEditing ? (
                          <input
                            type="number"
                            required
                            value={editedData.monthlyExpenses}
                            onChange={(e) => setEditedData({ ...editedData, monthlyExpenses: e.target.value })}
                            className="w-full bg-surface-container border border-subtle focus:border-primary px-3 py-2 rounded-lg text-xs text-on-surface outline-none transition-all font-mono"
                          />
                        ) : (
                          <span className="text-on-surface font-semibold bg-surface-glass border border-subtle px-3 py-2 rounded-lg block font-mono">
                            ₹{(Number(profileData.monthlyExpenses) || 0).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="text-on-surface-variant uppercase block font-bold mb-1.5">Risk Profile Bound</label>
                        {isEditing ? (
                          <select
                            value={editedData.riskProfile}
                            onChange={(e) => setEditedData({ ...editedData, riskProfile: e.target.value })}
                            className="w-full bg-surface-container border border-subtle focus:border-primary px-3 py-2 rounded-lg text-xs text-on-surface outline-none transition-all"
                          >
                            <option value="conservative">Conservative</option>
                            <option value="balanced">Balanced</option>
                            <option value="aggressive">Aggressive</option>
                          </select>
                        ) : (
                          <span className="text-secondary font-semibold bg-secondary-container/15 border border-secondary/20 px-3 py-2 rounded-lg block capitalize font-bold">
                            {profileData.riskProfile} allocation
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Financial Goals Selection */}
                    <div className="text-xs">
                      <label className="text-on-surface-variant uppercase block font-bold mb-2">Active Financial Targets</label>
                      {isEditing ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                          {GOALS_OPTIONS.map((g) => {
                            const isSelected = editedData.goals.includes(g.id);
                            return (
                              <div
                                key={g.id}
                                onClick={() => handleGoalToggle(g.id)}
                                className={`p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 border ${
                                  isSelected 
                                    ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' 
                                    : 'border-subtle hover:border-primary/50'
                                }`}
                              >
                                <span className={`material-symbols-outlined text-base ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`}>
                                  {g.icon}
                                </span>
                                <div className="text-left">
                                  <p className="font-bold text-[11px] text-on-surface">{g.label}</p>
                                  <p className="text-[9px] text-on-surface-variant/80">{g.desc}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {profileData.goals.length > 0 ? (
                            profileData.goals.map((goalId) => {
                              const match = GOALS_OPTIONS.find(o => o.id === goalId);
                              if (!match) return null;
                              return (
                                <span key={goalId} className="flex items-center gap-1.5 bg-surface-glass border border-subtle px-3 py-1.5 rounded-full text-[11px] font-semibold text-on-surface">
                                  <span className="material-symbols-outlined text-[14px] text-primary">{match.icon}</span>
                                  {match.label}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-on-surface-variant/60 block py-1 italic">No targets selected yet.</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="border-t border-subtle/50 pt-6 flex justify-end gap-3">
                    {isEditing ? (
                      <>
                        <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                          Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={isSaving}>
                          {isSaving ? 'Saving Shifts...' : 'Save Changes'}
                        </Button>
                      </>
                    ) : (
                      <Button variant="primary" onClick={handleEdit}>
                        Edit Profile mandate
                      </Button>
                    )}
                  </div>
                </form>
              )}
            </div>

          </div>

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
