"use client";

import React, { useEffect, useState } from "react";
import ActionBar from "@/components/action-bar";
import StoryStream from "@/components/story-stream";
// import RewindDialog from "@/components/rewind-dialog";
import ActionInputDialog from "@/components/action-input-dialog";
import { useParams } from "next/navigation";
import TopBar from "@/components/top-bar";
import { getStory, submitTurn } from "@/lib/api/stories";

export type ActionType = "SYSTEM" | "DO" | "SAY" | "SEE" | "STORY" | "CONTINUE";

type StreamItem = { action: ActionType; text: string; userAction: string };

export default function AdventurePage() {
  const params = useParams();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isThinking, setIsThinking] = useState(false);

  const [stream, setStream] = useState<StreamItem[]>([]);

  const [activeAction, setActiveAction] = useState<ActionType | null>(null);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const data = await getStory(id);

        setStream(
          data.nodes.map((p) => ({
            action: p.actionType as ActionType,
            text: p.generatedText,
            userAction: p.userInput,
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

      setActiveAction(null);

      const res = await submitTurn(id, {
        action: activeAction,
        text,
        rewindToken: 0,
      });

      setStream((prev) => [
        ...prev,
        {
          action: res.node.actionType as ActionType,
          text: res.node.generatedText,
          userAction: res.node.userInput,
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const getActionText = ({
    action,
    userAction,
  }: {
    action: ActionType;
    userAction: string;
  }) => {
    switch (action) {
      case "DO":
        return `You '${userAction}' `;
      case "SAY":
        return `You say '${userAction}'`;
      case "SEE":
        return `You see ${userAction}`;
      case "STORY":
        return `You shape the story`;
      case "CONTINUE":
        return "You continue with the story";
      default:
        return "";
    }
  };

  return (
    <>
      <TopBar />
      <div className="pb-64 pt-8 px-6">
        {isLoading ? (
          <div className="text-center text-[oklch(0.40_0_0)] text-sm py-12">Loading…</div>
        ) : (
          <>
            <div className="space-y-8 max-w-prose mx-auto">
              {stream.map((item, i) => {
                return (
                  <React.Fragment key={i}>
                    {item.action !== "SYSTEM" && (
                      <div className="text-xs italic text-[oklch(0.48_0.06_74)] tracking-wide">
                        {getActionText({
                          action: item.action,
                          userAction: item.userAction,
                        })}
                      </div>
                    )}
                    <StoryStream paragraphs={[item.text]} />
                  </React.Fragment>
                );
              })}
            </div>

            {isThinking && (
              <div className="mt-8 text-sm text-[oklch(0.50_0.07_74)] animate-pulse text-center tracking-wide">
                The world is responding…
              </div>
            )}

            <ActionBar onAction={setActiveAction} disabled={isThinking} />

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
