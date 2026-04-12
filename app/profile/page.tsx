"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HomeBar from "@/components/home-bar";
import { useAuth } from "@/lib/auth-context";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, updateProfile, changePassword } = useAuth();

  // Profile form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  const initial = user.name.charAt(0).toUpperCase();
  const profileDirty = name !== user.name || email !== user.email;

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileDirty) return;
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      await updateProfile({ name: name.trim(), email: email.trim() });
      setProfileMsg({ ok: true, text: "Profile updated." });
    } catch (err: any) {
      setProfileMsg({ ok: false, text: err?.message ?? "Failed to update profile." });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (newPassword.length < 6) {
      setPasswordMsg({ ok: false, text: "New password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ ok: false, text: "Passwords do not match." });
      return;
    }
    setPasswordSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordMsg({ ok: true, text: "Password changed successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordMsg({ ok: false, text: err?.message ?? "Failed to change password." });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <>
      <HomeBar />

      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-[oklch(0.79_0.165_78/0.05)] blur-[140px]" />
      </div>

      <main className="min-h-screen pt-20 pb-16 px-6 flex flex-col items-center">
        <div className="w-full max-w-md space-y-8">

          {/* Avatar + name */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
              style={{ background: "oklch(0.22 0.04 78)", color: "oklch(0.79 0.165 78)" }}
            >
              {initial}
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-[oklch(0.90_0.005_74)]">{user.name}</p>
              <p className="text-sm text-[oklch(0.45_0_0)]">{user.email}</p>
            </div>
          </div>

          {/* ── Profile section ── */}
          <section className="glass-card rounded-2xl p-6 space-y-5">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[oklch(0.45_0_0)]">
              Profile
            </h2>

            {user.dateOfBirth && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[oklch(0.42_0_0)]">
                  Date of Birth
                </p>
                <p className="text-sm text-[oklch(0.60_0_0)]">
                  {new Date(user.dateOfBirth + "T00:00:00").toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                  <span className="ml-2 text-[10px] text-[oklch(0.35_0_0)] uppercase tracking-wide">· Cannot be changed</span>
                </p>
              </div>
            )}

            <form onSubmit={handleProfileSave} className="space-y-4">
              <Field label="Name">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setProfileMsg(null); }}
                  required
                  className={inputCls}
                  placeholder="Your name"
                />
              </Field>

              <Field label="Email">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setProfileMsg(null); }}
                  required
                  className={inputCls}
                  placeholder="you@example.com"
                />
              </Field>

              {profileMsg && (
                <p className={`text-xs ${profileMsg.ok ? "text-green-400" : "text-[oklch(0.65_0.22_27)]"}`}>
                  {profileMsg.text}
                </p>
              )}

              <button
                type="submit"
                disabled={!profileDirty || profileSaving}
                className={saveBtnCls(!profileDirty || profileSaving)}
              >
                {profileSaving ? "Saving…" : "Save Changes"}
              </button>
            </form>
          </section>

          {/* ── Password section ── */}
          <section className="glass-card rounded-2xl p-6 space-y-5">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[oklch(0.45_0_0)]">
              Change Password
            </h2>

            <form onSubmit={handlePasswordSave} className="space-y-4">
              <Field label="Current Password">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => { setCurrentPassword(e.target.value); setPasswordMsg(null); }}
                  required
                  className={inputCls}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </Field>

              <Field label="New Password">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setPasswordMsg(null); }}
                  required
                  className={inputCls}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </Field>

              <Field label="Confirm New Password">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setPasswordMsg(null); }}
                  required
                  className={inputCls}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </Field>

              {passwordMsg && (
                <p className={`text-xs ${passwordMsg.ok ? "text-green-400" : "text-[oklch(0.65_0.22_27)]"}`}>
                  {passwordMsg.text}
                </p>
              )}

              <button
                type="submit"
                disabled={!currentPassword || !newPassword || !confirmPassword || passwordSaving}
                className={saveBtnCls(!currentPassword || !newPassword || !confirmPassword || passwordSaving)}
              >
                {passwordSaving ? "Changing…" : "Change Password"}
              </button>
            </form>
          </section>

        </div>
      </main>
    </>
  );
}

// ── Shared sub-components / helpers ──

const inputCls = [
  "w-full rounded-lg px-3.5 py-2.5 text-sm border transition-colors",
  "bg-[oklch(0.10_0.01_65)] border-[oklch(1_0_0/10%)]",
  "text-[oklch(0.88_0.005_74)] placeholder:text-[oklch(0.32_0_0)]",
  "focus:outline-none focus:border-[oklch(0.79_0.165_78/40%)] focus:bg-[oklch(0.12_0.01_65)]",
].join(" ");

function saveBtnCls(disabled: boolean) {
  return [
    "w-full py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 border",
    disabled
      ? "bg-[oklch(0.14_0.02_78/50%)] border-[oklch(0.79_0.165_78/10%)] text-[oklch(0.45_0_0)] cursor-not-allowed"
      : "bg-[oklch(0.22_0.04_78)] border-[oklch(0.79_0.165_78/30%)] text-[oklch(0.79_0.165_78)] hover:bg-[oklch(0.28_0.05_78)] hover:border-[oklch(0.79_0.165_78/50%)]",
  ].join(" ");
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[oklch(0.42_0_0)]">
        {label}
      </label>
      {children}
    </div>
  );
}
