import StoryWord from "./story-word";

export default function StoryParagraph({
  text,
  startToken,
  timelineEndToken,
  onWordClick,
}: {
  text: string;
  startToken: number;
  timelineEndToken: number;
  onWordClick: (token: number) => void;
}) {
  const words = text.split(" ");

  return (
    <p>
      {words.map((word, i) => {
        const tokenIndex = startToken + i;
        const isFuture = tokenIndex > timelineEndToken;

        return (
          <StoryWord
            key={i}
            word={word}
            tokenIndex={tokenIndex}
            isFuture={isFuture}
            onClick={onWordClick}
          />
        );
      })}
    </p>
  );
}
