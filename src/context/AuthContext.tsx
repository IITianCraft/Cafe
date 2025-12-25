import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '@/types';
import { toast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { api } from '@/services/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  isLoginModalOpen: boolean;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isAdmin: false,
  });
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sync with Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();

          // Verify with backend to get role and full profile
          const response = await api.post('/api/auth/verify', { idToken: token });

          if (response.data.success) {
            const userData = response.data.data;
            const user: User = {
              id: userData.uid,
              name: userData.name || firebaseUser.email?.split('@')[0] || 'User',
              email: userData.email || '',
              role: userData.role || 'user',
              createdAt: userData.createdAt || new Date().toISOString(),
              phone: userData.phone,
              avatar: userData.profileUrl
            };

            setAuthState({
              user,
              token,
              isAuthenticated: true,
              isAdmin: user.role === 'admin',
            });
          }
        } catch (error: any) {
          console.error('Error syncing user:', error);
          setAuthError(
            `Backend connection failed: ${error.message || 'Unknown error'}. ` +
            `Ensure VITE_API_BASE_URL is set correctly.`
          );
          // If backend sync fails, logout or handle error
          // For now, minimal fallback or logout
          // signOut(auth); // Optional: force logout if backend rejects
        }
      } else {
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isAdmin: false,
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // specific state updates handled by onAuthStateChanged
      setIsLoginModalOpen(false);
      toast({
        title: "Welcome back!",
        description: "Successfully logged in.",
      });
      return true;
    } catch (error: any) {
      console.error("Login Error Details:", error);
      let message = "Invalid email or password";
      const errorCode = error.code;
      if (errorCode === 'auth/wrong-password') {
        message = "Incorrect password. Please try again.";
      } else if (errorCode === 'auth/user-not-found') {
        message = "No account found with this email.";
      } else if (errorCode === 'auth/invalid-email') {
        message = "Invalid email format.";
      } else if (errorCode === 'auth/too-many-requests') {
        message = "Too many failed attempts. Please try again later.";
      } else if (error.message) {
        message = error.message;
      }

      toast({
        title: "Login failed",
        description: message,
        variant: "destructive",
      });
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Wait for auth state change which triggers backend sync
      // Note: Backend creates user doc on /api/auth/verify call if missing

      setIsLoginModalOpen(false);
      toast({
        title: "Account created!",
        description: "Welcome to Cafe Resto",
      });
      return true;
    } catch (error: any) {
      let message = "Registration failed. Please try again.";
      const errorCode = error.code;
      if (errorCode === 'auth/email-already-in-use') {
        message = "An account with this email already exists.";
      } else if (errorCode === 'auth/weak-password') {
        message = "Password should be at least 6 characters.";
      } else if (errorCode === 'auth/invalid-email') {
        message = "Invalid email format.";
      } else if (error.message) {
        message = error.message;
      }

      toast({
        title: "Registration failed",
        description: message,
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged out",
        description: "See you soon!",
      });
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  const updateUser = (updates: Partial<User>) => {
    // Only local update? Or push to backend? 
    // For now simple local update as requested by existing interface
    if (authState.user) {
      setAuthState(prev => ({
        ...prev,
        user: { ...prev.user!, ...updates }
      }));
    }
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      register,
      logout,
      updateUser,
      openLoginModal,
      closeLoginModal,
      isLoginModalOpen,
      authError,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
