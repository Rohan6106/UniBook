"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser, getIdToken, signOut } from 'firebase/auth'; // <-- 1. Import signOut
import { auth } from '@/lib/firebase';
import { CircularProgress, Box } from '@mui/material';

// --- THIS IS THE FIX (Part 1) ---
interface AuthContextType {
  user: FirebaseUser | null;
  idToken: string | null;
  loading: boolean;
  signOut: () => Promise<void>; // <-- 2. Add signOut to the type
}
// --- END OF FIX ---

const AuthContext = createContext<AuthContextType>({
  user: null,
  idToken: null,
  loading: true,
  signOut: async () => {}, // Provide a default empty function
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        const token = await getIdToken(currentUser);
        setIdToken(token);
      } else {
        setUser(null);
        setIdToken(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- THIS IS THE FIX (Part 2) ---
  // 3. Create the reusable signOut function
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // The onAuthStateChanged listener will automatically handle setting user to null.
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  // --- END OF FIX ---

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    // 4. Add the new function to the provider's value
    <AuthContext.Provider value={{ user, idToken, loading, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);