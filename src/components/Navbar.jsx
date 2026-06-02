import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { databaseService } from '../services/databaseService';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const fetchNotifs = async () => {
      if (!currentUser) return;
      try {
        const list = await databaseService.getNotifications(currentUser.uid);
        setNotifications(list);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    };
    
    fetchNotifs();
    // Poll notifications every 30 seconds for dynamic calculations simulation
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Click outside to close dropdown
  useEffect(() => {
    if (!showNotifDropdown) return;
    const handleOutsideClick = () => setShowNotifDropdown(false);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [showNotifDropdown]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (id) => {
    if (!currentUser) return;
    try {
      const updated = await databaseService.markNotificationAsRead(id, currentUser.uid);
      setNotifications(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    if (!currentUser) return;
    try {
      const updated = await databaseService.clearNotifications(currentUser.uid);
      setNotifications(updated);
      setShowNotifDropdown(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-20 max-w-container-max mx-auto bg-surface-glass backdrop-blur-xl border-b border-subtle shadow-sm">
      <div className="flex items-center gap-2">
        {/* Mobile/Tablet Hamburger Toggle */}
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-sidebar'))}
          className="lg:hidden p-2 text-on-surface hover:text-primary transition-colors flex items-center justify-center mr-1 cursor-pointer"
          aria-label="Toggle Navigation Drawer"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>
        
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <img 
            alt="Finora AI Logo" 
            className="h-8 w-auto" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCygm_NM8kRwL1FcaJywqDwScJif6oVV6d5qK85o0ww2441ZBzYYtZmPK-xZm5G8CcF60hY1w-8uK4-ZvcdpuUFsQ3M9eOacffKlmpqrXm8-3AVL_ltlGiwp3ZNjNTl5adqYKnx76zztVoQ7-4cvGM59sEJ1CcqCPPzf4M7rx4DOHu3D4s7IOfMo_EQbi2EDLPVvWTWudbZ2fwuEMM3AlPF6hV-CMXaas_vOZlQ0M0NLnrETqbHBQdRZHD2ALBcg2Ttds8RcBNxcF0"
          />
          <span className="font-display-lg text-headline-md font-bold text-primary">Finora AI</span>
        </div>
      </div>
      
      <nav className="hidden lg:flex gap-8">
        <Link 
          to="/" 
          className={`font-label-md text-label-md transition-colors ${
            isActive('/') ? 'text-primary border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          Home
        </Link>
        <Link 
          to="/dashboard" 
          className={`font-label-md text-label-md transition-colors ${
            isActive('/dashboard') ? 'text-primary border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          Dashboard
        </Link>
        <Link 
          to="/investments" 
          className={`font-label-md text-label-md transition-colors ${
            isActive('/investments') ? 'text-primary border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          Investments
        </Link>
        <Link 
          to="/ai-advisor" 
          className={`font-label-md text-label-md transition-colors ${
            isActive('/ai-advisor') ? 'text-primary border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          AI Chat
        </Link>
      </nav>

      <div className="flex items-center gap-4">
        {currentUser ? (
          <>
            {/* Notification Bell and Dropdown */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative p-2 rounded-full hover:bg-surface-glass text-on-surface transition-colors cursor-pointer flex items-center justify-center"
                aria-label="View Notifications"
              >
                <span className="material-symbols-outlined text-xl">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-secondary rounded-full border border-surface-container-lowest animate-pulse" />
                )}
              </button>
              
              {/* Dropdown Menu */}
              {showNotifDropdown && (
                <div className="absolute right-0 top-full mt-3 w-80 glass-card border border-subtle rounded-2xl p-4 shadow-xl z-50 animate-fade-in text-left space-y-3">
                  <div className="flex justify-between items-center border-b border-subtle/50 pb-2.5">
                    <span className="text-[10px] font-bold text-on-surface uppercase tracking-wider">Alerts & Targets</span>
                    {notifications.length > 0 && (
                      <button 
                        onClick={handleClearAll}
                        className="text-[9px] uppercase tracking-wider text-red-400 hover:text-red-300 font-bold cursor-pointer"
                      >
                        Dismiss All
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-[10px] text-on-surface-variant/60 italic py-4 text-center">No alerts triggered for this session.</p>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => handleMarkAsRead(n.id)}
                          className={`p-3 rounded-xl border text-[11px] leading-relaxed cursor-pointer transition-colors relative ${
                            n.read 
                              ? 'bg-surface-glass/40 border-subtle/30 text-on-surface-variant/80' 
                              : 'bg-primary/5 border-primary/20 text-on-surface font-semibold'
                          }`}
                        >
                          <p className="pr-4">{n.message}</p>
                          <span className="text-[8px] text-on-surface-variant/40 block mt-1.5 font-mono">
                            {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {!n.read && (
                            <span className="absolute top-3.5 right-3.5 w-1.5 h-1.5 bg-primary rounded-full" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <span className="hidden lg:inline-block text-xs font-label-md text-on-surface-variant">
              Welcome, <span className="text-secondary font-bold">{currentUser.email?.split('@')[0]}</span>
            </span>
            <button 
              onClick={() => navigate('/dashboard')}
              className="font-label-sm text-label-sm uppercase px-4 py-2 border border-subtle text-on-surface hover:bg-surface-glass transition-all scale-95 active:scale-90 cursor-pointer"
            >
              Portal
            </button>
            <button 
              onClick={logout}
              className="font-label-sm text-label-sm uppercase px-6 py-2 bg-gradient-to-r from-red-950 to-red-800 text-on-surface font-bold rounded-lg border border-red-500/30 shadow-lg hover:shadow-red-500/10 transition-all scale-95 active:scale-90 cursor-pointer"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => navigate('/login')}
              className="hidden lg:block font-label-sm text-label-sm uppercase px-4 py-2 border border-subtle text-on-surface hover:bg-surface-glass transition-all scale-95 active:scale-90 cursor-pointer"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/signup')}
              className="font-label-sm text-label-sm uppercase px-6 py-2 bg-gradient-to-r from-primary-container to-primary text-on-primary-container font-bold rounded-lg shadow-lg hover:shadow-primary/20 transition-all scale-95 active:scale-90 cursor-pointer"
            >
              Get Started
            </button>
          </>
        )}
      </div>
    </header>
  );
}
