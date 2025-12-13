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
import { getSettings, saveSettings } from "@/lib/settings";

export default function SettingsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [settings, setSettings] = useState(getSettings());

  function update<K extends keyof typeof settings>(
    key: K,
    value: typeof settings[K],
  ) {
    const next = { ...settings, [key]: value };
    setSettings(next);
    saveSettings(next);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="mature">
              Allow mature & explicit content
            </Label>
            <Switch
              id="mature"
              checked={settings.matureContent}
              onCheckedChange={(v) => update("matureContent", v)}
            />
          </div>

          <p className="text-sm text-neutral-400">
            When enabled, the story may include explicit language, violence,
            or sexual themes. This cannot be undone per story once generated.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
