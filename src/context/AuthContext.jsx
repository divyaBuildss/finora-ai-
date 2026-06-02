import { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import Loading from '../components/Loading';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Expose isOfflineMode parameter to UI context cleanly
  const [isOfflineMode] = useState(() => {
    return !import.meta.env.VITE_FIREBASE_API_KEY || 
           import.meta.env.VITE_FIREBASE_API_KEY.includes("Placeholder") || 
           import.meta.env.VITE_FIREBASE_API_KEY.includes("FakeKey");
  });

  useEffect(() => {
    if (isOfflineMode) {
      console.warn("Finora AI is running in local high-fidelity simulation mode (placeholder API keys).");
    }

    // Centralized session persistence listener
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, [isOfflineMode]);

  // --- Wrapper Functions mapping to centralized authService ---
  const signup = async (email, password, fullName = "") => {
    const user = await authService.registerUser(email, password, fullName);
    if (isOfflineMode) setCurrentUser(user);
    return user;
  };

  const login = async (email, password) => {
    const user = await authService.loginUser(email, password);
    if (isOfflineMode) setCurrentUser(user);
    return user;
  };

  const googleLogin = async () => {
    const user = await authService.googleLogin();
    if (isOfflineMode) setCurrentUser(user);
    return user;
  };

  const logout = async () => {
    await authService.logoutUser();
    if (isOfflineMode) setCurrentUser(null);
  };

  const updateOnboardingStatus = async (status = true, onboardingData = {}) => {
    if (!currentUser) return;
    await authService.updateOnboardingStatus(currentUser.uid, status, onboardingData);
    setCurrentUser(prev => prev ? { 
      ...prev, 
      onboardingCompleted: status,
      ...onboardingData 
    } : null);
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    googleLogin,
    updateOnboardingStatus,
    isOfflineMode
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <Loading fullScreen /> : children}
    </AuthContext.Provider>
  );
}
