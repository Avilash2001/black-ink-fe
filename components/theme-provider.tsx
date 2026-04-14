"use client";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export default function ThemeProvider() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const html = document.documentElement;
    if (isLoading) return;
    const theme = user?.theme ?? 'dark';
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [user?.theme, isLoading]);

  return null;
}
