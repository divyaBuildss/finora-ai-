import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    const handleClose = () => setIsOpen(false);

    window.addEventListener('toggle-sidebar', handleToggle);
    window.addEventListener('close-sidebar', handleClose);

    return () => {
      window.removeEventListener('toggle-sidebar', handleToggle);
      window.removeEventListener('close-sidebar', handleClose);
    };
  }, []);

  const links = [
    { to: '/dashboard', label: 'Overview', icon: 'dashboard' },
    { to: '/ai-advisor', label: 'AI Advisor', icon: 'psychology' },
    { to: '/expenses', label: 'Expenses', icon: 'payments' },
    { to: '/budget', label: 'Budgeting', icon: 'account_balance_wallet' },
    { to: '/investments', label: 'Investments', icon: 'trending_up' },
    { to: '/goals', label: 'Wealth Goals', icon: 'track_changes' },
    { to: '/reports', label: 'Reports', icon: 'analytics' },
    { to: '/profile', label: 'Profile', icon: 'manage_accounts' },
  ];

  return (
    <>
      {/* Sidebar Overlay for Mobile/Tablet */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 z-30 mt-20 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar Content */}
      <aside className={`w-64 h-[calc(100vh-5rem)] fixed left-0 top-20 bg-surface-container-lowest border-r border-subtle flex flex-col justify-between p-6 z-40 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold mb-4 px-4 block">
            Control Panel
          </span>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg font-label-md text-label-md transition-all duration-200 group ${
                  isActive 
                    ? 'bg-primary/10 text-primary border-l-4 border-primary' 
                    : 'text-on-surface-variant hover:bg-surface-glass hover:text-on-surface'
                }`
              }
            >
              <span className="material-symbols-outlined text-xl transition-transform group-hover:scale-110">
                {link.icon}
              </span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="border-t border-subtle pt-6">
          <button
            onClick={() => {
              setIsOpen(false);
              logout();
              navigate('/');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-label-md text-label-md text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
          >
            <span className="material-symbols-outlined text-xl">
              logout
            </span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
