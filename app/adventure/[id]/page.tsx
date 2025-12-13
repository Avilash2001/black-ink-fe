"use client";

import { useState } from "react";
import ActionBar from "@/components/action-bar";
import StoryStream from "@/components/story-stream";
import RewindDialog from "@/components/rewind-dialog";
import ActionInputDialog from "@/components/action-input-dialog";
import { submitTurn } from "@/lib/api";
import { saveAdventure } from "@/lib/storage";
import { useParams } from "next/navigation";
import TopBar from "@/components/top-bar";

const INITIAL_STORY = [
  "The forest is silent. The trees loom like ancient witnesses.",
  "Somewhere in the dark, something shifts. Your name is Ash.",
];

export type ActionType = "DO" | "SAY" | "STORY" | "SEE";

export default function AdventurePage() {
  const params = useParams();
  const id = params.id as string;

  const [story, setStory] = useState(INITIAL_STORY);
  const [focusMode, setFocusMode] = useState(false);

  // Count total tokens initially
  const totalTokens = story.join(" ").split(" ").length;

  const [timelineEndToken, setTimelineEndToken] = useState<number>(totalTokens);

  const [rewindToken, setRewindToken] = useState<number | null>(null);
  const [activeAction, setActiveAction] = useState<ActionType | null>(null);

  return (
    <>
      <TopBar focusMode={focusMode} />

      <div className="pb-32 pt-6" onDoubleClick={() => setFocusMode((f) => !f)}>
        <StoryStream
          paragraphs={story}
          timelineEndToken={timelineEndToken}
          onWordClick={setRewindToken}
        />

        <ActionBar onAction={setActiveAction} focusMode={focusMode} />

        <RewindDialog
          open={rewindToken !== null}
          rewindToken={rewindToken}
          story={story}
          onCancel={() => setRewindToken(null)}
          onConfirm={() => {
            if (rewindToken !== null) {
              setTimelineEndToken(rewindToken);
            }
            setRewindToken(null);
          }}
        />

        <ActionInputDialog
          action={activeAction}
          onCancel={() => setActiveAction(null)}
          onSubmit={async (text) => {
            if (!activeAction) return;

            const res = await submitTurn({
              action: activeAction,
              text,
              timelineEndToken,
            });

            setStory((prev) => [...prev, ...res.paragraphs]);

            // Move timeline forward to the new end
            const newTokenCount = [...story, ...res.paragraphs]
              .join(" ")
              .split(" ").length;

            setTimelineEndToken(newTokenCount);

            setActiveAction(null);

            saveAdventure({
              id,
              genre: "Unknown",
              name: "Ash",
              updatedAt: Date.now(),
            });
          }}
        />
      </div>
    </>
  );
}
