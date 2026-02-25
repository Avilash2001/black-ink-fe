"use client";

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
  const { user, updateMatureContent } = useAuth();

  return (
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
              onCheckedChange={(v) => updateMatureContent(v)}
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
