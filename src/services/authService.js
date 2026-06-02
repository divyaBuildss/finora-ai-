import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, parseFirebaseError } from './firebase';

const isOffline = () => {
  return !import.meta.env.VITE_FIREBASE_API_KEY || 
         import.meta.env.VITE_FIREBASE_API_KEY.includes("Placeholder") || 
         import.meta.env.VITE_FIREBASE_API_KEY.includes("FakeKey");
};

export const authService = {
  onAuthStateChanged(callback) {
    if (isOffline()) {
      const storedUser = localStorage.getItem('finora_user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      callback(user);
      return () => {}; // Mock unsubscribe
    }
    
    // Real Firebase Session Persistence
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          let profileCompleted = false;
          let fullName = user.displayName || "";
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            profileCompleted = data.profileCompleted || false;
            fullName = data.name || fullName;
          }
          
          callback({
            uid: user.uid,
            email: user.email,
            name: fullName,
            onboardingCompleted: profileCompleted
          });
        } catch (err) {
          console.error("Failed to fetch user doc:", err);
          callback({
            uid: user.uid,
            email: user.email,
            name: user.displayName || "",
            onboardingCompleted: false
          });
        }
      } else {
        callback(null);
      }
    });
  },

  async registerUser(email, password, fullName = "") {
    if (isOffline()) {
      const simulatedUser = { 
        uid: `sim_${Math.random().toString(36).substr(2, 9)}`, 
        email, 
        name: fullName || email.split('@')[0], 
        onboardingCompleted: false 
      };
      localStorage.setItem('finora_user', JSON.stringify(simulatedUser));
      return simulatedUser;
    }

    // Real Firebase Registration
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create Firestore document matching 'users/{uid}' with all required data fields
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      name: fullName || email.split('@')[0],
      email: email,
      profileCompleted: false,
      createdAt: new Date().toISOString()
    });

    return user;
  },

  async loginUser(email, password) {
    if (isOffline()) {
      const simulatedUser = { 
        uid: `sim_${Math.random().toString(36).substr(2, 9)}`, 
        email, 
        name: email.split('@')[0], 
        onboardingCompleted: true 
      };
      localStorage.setItem('finora_user', JSON.stringify(simulatedUser));
      return simulatedUser;
    }

    // Real Firebase Login
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },

  async googleLogin() {
    if (isOffline()) {
      const simulatedUser = { 
        uid: `google_sim_${Math.random().toString(36).substr(2, 9)}`, 
        email: "google.client@finora-trust.com", 
        name: "Premium HNW Client", 
        onboardingCompleted: true 
      };
      localStorage.setItem('finora_user', JSON.stringify(simulatedUser));
      return simulatedUser;
    }

    // Real Google Popup Login
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;
    
    // Check if Firestore document already exists, if not create it
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      await setDoc(docRef, {
        uid: user.uid,
        name: user.displayName || user.email.split('@')[0],
        email: user.email,
        profileCompleted: false,
        createdAt: new Date().toISOString()
      });
    }

    return user;
  },

  async logoutUser() {
    if (isOffline()) {
      localStorage.removeItem('finora_user');
      return true;
    }
    // Real Firebase Logout
    await signOut(auth);
    return true;
  },

  async resetPassword(email) {
    if (isOffline()) {
      return { success: true };
    }
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error: parseFirebaseError(error) };
    }
  },

  async updateOnboardingStatus(uid, status = true, onboardingData = {}) {
    if (isOffline()) {
      const stored = localStorage.getItem('finora_user');
      if (stored) {
        const user = JSON.parse(stored);
        const updated = { ...user, onboardingCompleted: status, ...onboardingData };
        localStorage.setItem('finora_user', JSON.stringify(updated));
      }
      return true;
    }

    // Real Firestore Status Update
    await setDoc(doc(db, 'users', uid), {
      profileCompleted: status,
      ...onboardingData
    }, { merge: true });
    
    return true;
  }
};
