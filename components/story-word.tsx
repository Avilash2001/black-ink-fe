"use client";

export default function StoryWord({
  word,
  tokenIndex,
  isFuture,
  onClick,
}: {
  word: string;
  tokenIndex: number;
  isFuture: boolean;
  onClick: (token: number) => void;
}) {
  return (
    <span
      onClick={() => {
        if (!isFuture) onClick(tokenIndex);
      }}
      className={[
        "px-0.5 rounded transition-colors",
        isFuture
          ? "text-neutral-600 cursor-not-allowed"
          : "cursor-pointer hover:bg-neutral-800",
      ].join(" ")}
    >
      {word}{" "}
    </span>
  );
}
