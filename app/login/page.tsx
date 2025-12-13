"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setSession } from "@/lib/storage";
import { login } from "@/lib/api/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-semibold">Sign In</h1>

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
  );
}
