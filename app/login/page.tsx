"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "@/lib/api/auth";
import HomeBar from "@/components/home-bar";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <>
      <HomeBar />

      {/* Atmospheric background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[oklch(0.78_0.14_74/0.05)] blur-[130px]" />
      </div>

      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="glass-card rounded-2xl px-8 py-10 space-y-7">
            <div className="text-center space-y-1.5">
              <h1 className="text-3xl font-bold tracking-tight">Sign in</h1>
              <p className="text-sm text-[oklch(0.48_0_0)]">
                Welcome back to Black Ink
              </p>
            </div>

            <div className="space-y-3">
              <Input
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-[oklch(1_0_0/5%)] border-[oklch(1_0_0/10%)] focus-visible:border-[oklch(0.78_0.14_74/60%)] focus-visible:ring-[oklch(0.78_0.14_74/20%)]"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-[oklch(1_0_0/5%)] border-[oklch(1_0_0/10%)] focus-visible:border-[oklch(0.78_0.14_74/60%)] focus-visible:ring-[oklch(0.78_0.14_74/20%)]"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 text-center -mt-2">{error}</p>
            )}

            <Button
              disabled={!email || !password || loading}
              className="w-full h-11 text-base font-semibold shadow-[0_0_25px_oklch(0.78_0.14_74/0.3)] hover:shadow-[0_0_35px_oklch(0.78_0.14_74/0.45)] transition-shadow duration-300"
              onClick={async () => {
                try {
                  setLoading(true);
                  await signIn(email, password);
                  router.push("/");
                } catch {
                  setError("Invalid email or password");
                } finally {
                  setLoading(false);
                }
              }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </Button>

            <p className="text-sm text-[oklch(0.45_0_0)] text-center">
              New here?{" "}
              <Link
                href="/register"
                className="text-[oklch(0.78_0.14_74)] hover:text-[oklch(0.88_0.14_74)] transition-colors underline-offset-2 hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
