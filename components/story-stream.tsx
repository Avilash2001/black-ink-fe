import { useEffect, useRef } from "react";

export default function StoryStream({ paragraphs }: { paragraphs: string[] }) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [paragraphs.length]);

  return (
    <div className="space-y-10 leading-relaxed text-lg max-w-prose mx-auto">
      {paragraphs.map((text, i) => (
        <p key={i}>{text}</p>
      ))}

      <div ref={endRef} />
    </div>
  );
}
