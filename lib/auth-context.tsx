"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  getSession as getStoredSession,
  setSession as storeSession,
  clearSession as removeSession,
  Session,
} from "./storage";
import { login, logout, register, getMe, updateMe, updateProfile, changePassword } from "./api/auth";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: Session | null;
  isLoading: boolean;
  signIn: typeof login;
  signUp: typeof register;
  signOut: () => Promise<void>;
  updateMatureContent: (value: boolean) => Promise<void>;
  updateProfile: (patch: { name?: string; email?: string }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
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

  const updateMatureContent = async (value: boolean) => {
    if (!user) return;

    const prev = user;
    const optimistic: Session = { ...user, matureEnabled: value };
    setUser(optimistic);
    storeSession(optimistic);

    try {
      const updated = await updateMe({ matureEnabled: value });
      setUser(updated);
      storeSession(updated);
    } catch {
      setUser(prev);
      storeSession(prev);
    }
  };

  const updateProfileFn = async (patch: { name?: string; email?: string }) => {
    const updated = await updateProfile(patch);
    setUser(updated);
    storeSession(updated);
  };

  const changePasswordFn = async (currentPassword: string, newPassword: string) => {
    await changePassword(currentPassword, newPassword);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, updateMatureContent, updateProfile: updateProfileFn, changePassword: changePasswordFn }}>
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
