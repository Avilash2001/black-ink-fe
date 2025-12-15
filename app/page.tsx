"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/storage";
import { useEffect, useState } from "react";
import { deleteStory, getMyStories } from "@/lib/api/stories";
import { StoryListItem } from "@/types/story";
import { Trash } from "lucide-react";
import HomeBar from "@/components/home-bar";

export default function Home() {
  const session = getSession();

  const [isLoading, setIsLoading] = useState(true);
  const [adventures, setAdventures] = useState<StoryListItem[]>([]);

  useEffect(() => {
    const fetchAdventures = async () => {
      try {
        const data = await getMyStories();
        setAdventures(data);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdventures();
  }, []);

  console.log({ adventures });

  return (
    <>
      <HomeBar />
      <main className="min-h-screen flex flex-col items-center justify-center gap-8">
        <h1 className="text-4xl font-semibold">Black Ink</h1>

        <p className="max-w-md text-center text-neutral-400">
          Embark on epic text-based adventures powered by AI. Create your hero,
          choose your genre, and let the story unfold!
        </p>

        {!session ? (
          <Link href="/login">
            <Button size="lg">Sign In</Button>
          </Link>
        ) : (
          <>
            <Link href="/adventure/new">
              <Button size="lg">Start New Adventure</Button>
            </Link>
            {isLoading ? (
              <div className="text-center text-neutral-400">Loading…</div>
            ) : (
              <>
                {adventures.length > 0 && (
                  <div className="w-full max-w-md space-y-3">
                    <h2 className="text-sm text-neutral-400">
                      Your Adventures
                    </h2>

                    {adventures.map((a) => (
                      <Link
                        key={a._id}
                        href={`/adventure/${a._id}`}
                        className="flex justify-between items-center border border-neutral-800 rounded-lg p-3 hover:bg-neutral-900"
                      >
                        <div>
                          <div className="font-medium">{a.protagonist}</div>
                          <div className="text-sm text-neutral-400">
                            {a.genre}
                          </div>
                        </div>
                        <Trash
                          size={18}
                          onClick={async (e) => {
                            e.preventDefault();
                            const ok = confirm(
                              "Delete this story permanently?"
                            );
                            if (!ok) return;

                            await deleteStory(a._id);
                            setAdventures((prev) =>
                              prev.filter((s) => s._id !== a._id)
                            );
                          }}
                        />
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </>
  );
}
