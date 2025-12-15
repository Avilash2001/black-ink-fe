"use client";

import { useEffect, useState } from "react";
import ActionBar from "@/components/action-bar";
import StoryStream from "@/components/story-stream";
import RewindDialog from "@/components/rewind-dialog";
import ActionInputDialog from "@/components/action-input-dialog";
import { useParams } from "next/navigation";
import TopBar from "@/components/top-bar";
import { getStory, submitTurn } from "@/lib/api/stories";

export type ActionType = "SYSTEM" | "DO" | "SAY" | "SEE" | "STORY" | "CONTINUE";

/* ───────────────────────────────────────────── */

type StreamItem =
  | { kind: "story"; text: string }
  | { kind: "action"; action: ActionType; text: string };

/* ───────────────────────────────────────────── */

export default function AdventurePage() {
  const params = useParams();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isThinking, setIsThinking] = useState(false);

  const [story, setStory] = useState<string[]>([]);
  const [stream, setStream] = useState<StreamItem[]>([]);
  const [focusMode, setFocusMode] = useState(false);

  const [timelineEndToken, setTimelineEndToken] = useState<number>(0);
  const [rewindToken, setRewindToken] = useState<number | null>(null);
  const [activeAction, setActiveAction] = useState<ActionType | null>(null);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const data = await getStory(id);

        const paragraphs = data.nodes.flatMap((node) =>
          node.generatedText.split("\n\n")
        );

        const lastToken = Math.max(...data.nodes.map((n) => n.tokenEnd));

        setStory(paragraphs);
        setTimelineEndToken(lastToken);

        setStream(
          paragraphs.map((p) => ({
            kind: "story" as const,
            text: p,
          }))
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchStory();
  }, [id]);

  const handleSubmitTurn = async (text: string) => {
    if (!activeAction) return;

    try {
      setIsThinking(true);

      setStream((prev) => [
        ...prev,
        {
          kind: "action" as const,
          action: activeAction,
          text,
        },
      ]);

      setActiveAction(null);

      const res = await submitTurn(id, {
        action: activeAction,
        text,
        rewindToken: timelineEndToken,
      });

      setStory((prev) => [...prev, ...res.paragraphs]);

      setStream((prev) => [
        ...prev,
        ...res.paragraphs.map((p) => ({
          kind: "story" as const,
          text: p,
        })),
      ]);

      const newTokenCount = [...story, ...res.paragraphs]
        .join(" ")
        .split(" ").length;

      setTimelineEndToken(newTokenCount);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <>
      <TopBar focusMode={focusMode} />

      {/* <div className="pb-32 pt-6" onDoubleClick={() => setFocusMode((f) => !f)}> */}
      <div className="pb-32 pt-6 px-6">
        {isLoading ? (
          <div className="text-center text-neutral-400">Loading…</div>
        ) : (
          <>
            <div className="space-y-8 max-w-prose mx-auto">
              {stream.map((item, i) => {
                console.log({ item });
                if (item.kind === "action") {
                  return (
                    <div key={i} className="text-xs italic text-neutral-400">
                      You {item.action.toLowerCase()}
                      {item.action !== "CONTINUE" && `: “${item.text}”`}
                    </div>
                  );
                }

                return (
                  <StoryStream
                    key={`story-${i}`}
                    paragraphs={[item.text]}
                    timelineEndToken={timelineEndToken}
                    onWordClick={setRewindToken}
                  />
                );
              })}
            </div>

            {isThinking && (
              <div className="mt-6 text-sm text-neutral-400 animate-pulse text-center">
                The world is responding…
              </div>
            )}

            <ActionBar
              onAction={setActiveAction}
              focusMode={focusMode}
              disabled={isThinking}
            />

            {/* <RewindDialog
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
            /> */}

            <ActionInputDialog
              action={activeAction}
              onCancel={() => setActiveAction(null)}
              onSubmit={handleSubmitTurn}
            />
          </>
        )}
      </div>
    </>
  );
}
