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

export default function SettingsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user, updateMatureContent, setDateOfBirth } = useAuth();

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

            <p className="text-sm text-neutral-400">
              When enabled, stories and mysteries may include explicit language,
              graphic violence, gore, and sexual themes. Age verification
              required on first enable.
            </p>
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
              <p className="text-sm font-semibold text-[oklch(0.75_0.15_27)]">
                This is permanent and cannot be changed.
              </p>
              <p className="text-xs text-[oklch(0.55_0_0)] leading-relaxed">
                Your date of birth will be saved to your account to verify you
                are 18 or older. Once set, it cannot be modified. By continuing
                you confirm this is your real date of birth.
              </p>
            </div>

            <form onSubmit={handleDobSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[oklch(0.42_0_0)]">
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
                    "bg-[oklch(0.10_0.01_65)] border-[oklch(1_0_0/10%)]",
                    "text-[oklch(0.88_0.005_74)]",
                    "focus:outline-none focus:border-[oklch(0.79_0.165_78/40%)]",
                    "[&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:cursor-pointer",
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
                  className="flex-1 py-2.5 text-sm rounded-lg border border-[oklch(1_0_0/10%)] text-[oklch(0.50_0_0)] hover:text-[oklch(0.70_0_0)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!dob || dobSaving}
                  className={[
                    "flex-1 py-2.5 text-sm font-semibold rounded-lg border transition-all",
                    !dob || dobSaving
                      ? "bg-[oklch(0.14_0.02_78/50%)] border-[oklch(0.79_0.165_78/10%)] text-[oklch(0.45_0_0)] cursor-not-allowed"
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
