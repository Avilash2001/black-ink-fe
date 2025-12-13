import { useEffect, useRef } from "react";
import StoryParagraph from "./story-paragraph";

export default function StoryStream({
  paragraphs,
  timelineEndToken,
  onWordClick,
}: {
  paragraphs: string[];
  timelineEndToken: number;
  onWordClick: (token: number) => void;
}) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [paragraphs.length]);

  const paragraphsWithTokens = paragraphs.reduce<
    { text: string; startToken: number }[]
  >((acc, text) => {
    const last = acc[acc.length - 1];
    const startToken = last ? last.startToken + last.text.split(" ").length : 0;

    acc.push({ text, startToken });
    return acc;
  }, []);

  return (
    <div className="space-y-10 leading-relaxed text-lg max-w-prose mx-auto">
      {paragraphsWithTokens.map(({ text, startToken }, i) => (
        <StoryParagraph
          key={i}
          text={text}
          startToken={startToken}
          timelineEndToken={timelineEndToken}
          onWordClick={onWordClick}
        />
      ))}

      <div ref={endRef} />
    </div>
  );
}
