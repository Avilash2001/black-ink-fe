"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setSession } from "@/lib/storage";
import { login } from "@/lib/api/auth";
import HomeBar from "@/components/home-bar";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  return (
    <>
      <HomeBar />
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-6 text-center">
          <h1 className="text-4xl font-semibold">Sign in to Black Ink</h1>

          <p className="max-w-md text-center text-neutral-400">
            Embark on epic text-based adventures powered by AI. Create your
            hero, choose your genre, and let the story unfold!
          </p>

          <Input
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button
            disabled={!email.includes("@")}
            className="w-full"
            onClick={async () => {
              const data = await login(email);
              setSession(data);
              router.push("/");
            }}
          >
            Continue
          </Button>
        </div>
      </main>
    </>
  );
}
