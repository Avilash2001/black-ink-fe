"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { Sun, Moon } from "lucide-react";

export default function SettingsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user, updateMatureContent, setDateOfBirth, updateTheme } = useAuth();

  // DOB gate modal state
  const [dobModalOpen, setDobModalOpen] = useState(false);
  const [dob, setDob] = useState("");
  const [dobSaving, setDobSaving] = useState(false);
  const [dobError, setDobError] = useState<string | null>(null);

  const handleMatureToggle = (value: boolean) => {
    if (!value) {
      // Turning off — always allowed
      updateMatureContent(false);
      return;
    }
    // Turning on — need DOB if not already set
    if (!user?.dateOfBirth) {
      setDobModalOpen(true);
      return;
    }
    updateMatureContent(true);
  };

  const handleDobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDobError(null);
    if (!dob) return;

    // Must be at least 18
    const birth = new Date(dob);
    const ageCutoff = new Date();
    ageCutoff.setFullYear(ageCutoff.getFullYear() - 18);
    if (birth > ageCutoff) {
      setDobError("You must be at least 18 years old to enable mature content.");
      return;
    }

    setDobSaving(true);
    try {
      await setDateOfBirth(dob);
      await updateMatureContent(true);
      setDobModalOpen(false);
    } catch (err: any) {
      setDobError(err?.message ?? "Failed to save date of birth.");
    } finally {
      setDobSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="mature">
                Allow mature &amp; explicit content
              </Label>
              <Switch
                id="mature"
                checked={user?.matureEnabled ?? false}
                onCheckedChange={handleMatureToggle}
              />
            </div>

            <p className="text-sm text-[var(--text-lo)]">
              When enabled, stories and mysteries may include explicit language,
              graphic violence, gore, and sexual themes. Age verification
              required on first enable.
            </p>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="theme">Theme</Label>
                <p className="text-xs text-[var(--text-dim)]">
                  {user?.theme === 'light' ? 'Light mode' : 'Dark mode'}
                </p>
              </div>
              <button
                onClick={() => updateTheme(user?.theme === 'dark' ? 'light' : 'dark')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200"
                style={{
                  background: "var(--inp-bg)",
                  borderColor: "var(--bd)",
                  color: "var(--text-mid)",
                }}
              >
                {user?.theme === 'light' ? (
                  <><Moon size={13} /> Dark</>
                ) : (
                  <><Sun size={13} /> Light</>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* DOB verification modal */}
      <Dialog open={dobModalOpen} onOpenChange={(o) => { if (!o && !dobSaving) setDobModalOpen(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Age Verification Required</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div className="rounded-lg border border-[oklch(0.55_0.18_27/30%)] bg-[oklch(0.35_0.12_27/10%)] px-4 py-3 space-y-1.5">
              <p className="text-sm font-semibold text-[oklch(0.65_0.18_27)]">
                This is permanent and cannot be changed.
              </p>
              <p className="text-xs text-[var(--text-lo)] leading-relaxed">
                Your date of birth will be saved to your account to verify you
                are 18 or older. Once set, it cannot be modified. By continuing
                you confirm this is your real date of birth.
              </p>
            </div>

            <form onSubmit={handleDobSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-dim)]">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => { setDob(e.target.value); setDobError(null); }}
                  required
                  max={new Date().toISOString().split("T")[0]}
                  className={[
                    "w-full rounded-lg px-3.5 py-2.5 text-sm border transition-colors",
                    "bg-[var(--inp-bg)] border-[var(--bd)]",
                    "text-[var(--text-hi)]",
                    "focus:outline-none focus:border-[oklch(0.79_0.165_78/40%)]",
                    "dark:[&::-webkit-calendar-picker-indicator]:invert dark:[&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:cursor-pointer",
                  ].join(" ")}
                />
              </div>

              {dobError && (
                <p className="text-xs text-[oklch(0.65_0.22_27)]">{dobError}</p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDobModalOpen(false)}
                  disabled={dobSaving}
                  className="flex-1 py-2.5 text-sm rounded-lg border border-[var(--bd)] text-[var(--text-lo)] hover:text-[var(--text-mid)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!dob || dobSaving}
                  className={[
                    "flex-1 py-2.5 text-sm font-semibold rounded-lg border transition-all",
                    !dob || dobSaving
                      ? "bg-[oklch(0.79_0.165_78/8%)] border-[oklch(0.79_0.165_78/10%)] text-[var(--text-lo)] cursor-not-allowed"
                      : "bg-[oklch(0.22_0.04_78)] border-[oklch(0.79_0.165_78/30%)] text-[oklch(0.79_0.165_78)] hover:bg-[oklch(0.28_0.05_78)]",
                  ].join(" ")}
                >
                  {dobSaving ? "Verifying…" : "Confirm & Enable"}
                </button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
