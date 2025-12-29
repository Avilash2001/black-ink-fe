"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { register } from "@/lib/api/auth";
import HomeBar from "@/components/home-bar";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <>
      <HomeBar />
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-6 text-center">
          <h1 className="text-4xl font-semibold">Create your account</h1>

          <Input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            disabled={!name || !email || !password || loading}
            className="w-full"
            onClick={async () => {
              try {
                setLoading(true);
                await register(name, email, password);
                await signIn(email, password);
                router.push("/");
              } catch {
                setError("Email already registered");
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? "Creating account…" : "Register"}
          </Button>

          <p className="text-sm text-neutral-400">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
