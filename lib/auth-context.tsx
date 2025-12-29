"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useTransition,
} from "react";
import {
  getSession as getStoredSession,
  setSession as storeSession,
  clearSession as removeSession,
  Session,
} from "./storage";
import { login, logout, register, getMe } from "./api/auth";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: Session | null;
  isLoading: boolean;
  signIn: typeof login;
  signUp: typeof register;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from storage immediately to prevent flash
  useEffect(() => {
    const stored = getStoredSession();
    if (stored) {
      setUser(stored);
    }
  }, []);

  // Verify session with backend
  useEffect(() => {
    const verify = async () => {
      try {
        const freshUser = await getMe();
        setUser(freshUser);
        storeSession(freshUser);
      } catch (err) {
        // If verification fails, clear everything
        setUser(null);
        removeSession();
      } finally {
        setIsLoading(false);
      }
    };

    verify();
  }, []);

  const signIn: typeof login = async (email, password) => {
    const u = (await login(email, password)) as Session;
    setUser(u);
    storeSession(u);
    return u;
  };

  const signUp: typeof register = async (name, email, password) => {
    const u = (await register(name, email, password)) as Session;
    setUser(u);
    storeSession(u);
    return u;
  };

  const signOut = async () => {
    try {
      await logout();
    } finally {
      setUser(null);
      removeSession();
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
