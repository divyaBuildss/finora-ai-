/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [isOfflineMode] = useState(() => {
    const isPlaceholderKey = !import.meta.env.VITE_FIREBASE_API_KEY || 
                             import.meta.env.VITE_FIREBASE_API_KEY.includes("Placeholder") || 
                             import.meta.env.VITE_FIREBASE_API_KEY.includes("FakeKey");
    return isPlaceholderKey || !auth;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const isPlaceholderKey = !import.meta.env.VITE_FIREBASE_API_KEY || 
                             import.meta.env.VITE_FIREBASE_API_KEY.includes("Placeholder") || 
                             import.meta.env.VITE_FIREBASE_API_KEY.includes("FakeKey");
    if (isPlaceholderKey || !auth) {
      const storedUser = localStorage.getItem('finora_user');
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  });

  const [loading, setLoading] = useState(() => {
    const isPlaceholderKey = !import.meta.env.VITE_FIREBASE_API_KEY || 
                             import.meta.env.VITE_FIREBASE_API_KEY.includes("Placeholder") || 
                             import.meta.env.VITE_FIREBASE_API_KEY.includes("FakeKey");
    return !(isPlaceholderKey || !auth);
  });

  useEffect(() => {
    if (isOfflineMode) {
      console.warn("Finora AI is running in local high-fidelity simulation mode (placeholder API keys).");
      return;
    }

    // Direct Firebase auth observer integration
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Retrieve complete database metrics from Cloud Firestore
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          let profileCompleted = false;
          let fullName = user.displayName || "";
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            profileCompleted = data.profileCompleted || false;
            fullName = data.name || fullName;
          }
          
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            name: fullName,
            onboardingCompleted: profileCompleted
          });
        } catch (err) {
          console.error("Failed to fetch user document from Firestore:", err);
          // Fallback user state
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            name: user.displayName || "",
            onboardingCompleted: false
          });
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [isOfflineMode]);

  // --- SIGNUP ---
  const signup = async (email, password, fullName = "") => {
    if (isOfflineMode) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const simulatedUser = { 
        uid: `sim_${Math.random().toString(36).substr(2, 9)}`, 
        email, 
        name: fullName || email.split('@')[0], 
        onboardingCompleted: false 
      };
      setCurrentUser(simulatedUser);
      localStorage.setItem('finora_user', JSON.stringify(simulatedUser));
      return simulatedUser;
    }

    // Real Firebase auth and firestore integration
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create Firestore document matching 'users/{uid}'
    await setDoc(doc(db, 'users', user.uid), {
      name: fullName || email.split('@')[0],
      email: email,
      createdAt: new Date().toISOString(),
      profileCompleted: false
    });

    return user;
  };

  // --- LOGIN ---
  const login = async (email, password) => {
    if (isOfflineMode) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const simulatedUser = { 
        uid: `sim_${Math.random().toString(36).substr(2, 9)}`, 
        email, 
        name: email.split('@')[0], 
        onboardingCompleted: true 
      };
      setCurrentUser(simulatedUser);
      localStorage.setItem('finora_user', JSON.stringify(simulatedUser));
      return simulatedUser;
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  };

  // --- GOOGLE LOGIN ---
  const googleLogin = async () => {
    if (isOfflineMode) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const simulatedUser = { 
        uid: `google_sim_${Math.random().toString(36).substr(2, 9)}`, 
        email: "google.client@finora-trust.com", 
        name: "Premium HNW Client", 
        onboardingCompleted: true 
      };
      setCurrentUser(simulatedUser);
      localStorage.setItem('finora_user', JSON.stringify(simulatedUser));
      return simulatedUser;
    }

    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;
    
    // Check if Firestore document already exists, if not create it
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      await setDoc(docRef, {
        name: user.displayName || user.email.split('@')[0],
        email: user.email,
        createdAt: new Date().toISOString(),
        profileCompleted: false
      });
    }

    return user;
  };

  // --- LOGOUT ---
  const logout = async () => {
    if (isOfflineMode) {
      setCurrentUser(null);
      localStorage.removeItem('finora_user');
      return;
    }
    await signOut(auth);
  };

  // --- ONBOARDING SYNC ---
  const updateOnboardingStatus = async (status = true, onboardingData = {}) => {
    if (!currentUser) return;
    
    if (isOfflineMode) {
      const updated = { 
        ...currentUser, 
        onboardingCompleted: status,
        ...onboardingData
      };
      setCurrentUser(updated);
      localStorage.setItem('finora_user', JSON.stringify(updated));
      return;
    }

    // Sync status and financial onboarding data back to firestore database
    await setDoc(doc(db, 'users', currentUser.uid), {
      profileCompleted: status,
      ...onboardingData
    }, { merge: true });

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
      {!loading && children}
    </AuthContext.Provider>
  );
}
