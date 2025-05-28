import { useEffect, useRef, useState } from "react";
import type { Route } from "./+types/prompts";
import AsciiTable from "~/wrapper-components/ascii-table";
import type { Prompt } from "system-prompt-storage/resources/prompts";

const ITEMS_PER_PAGE = 12;

export async function loader({}: Route.LoaderArgs) {
  const { getPrompts } = await import("~/.server/system-prompt");
  const prompts = await getPrompts({
    limit: ITEMS_PER_PAGE,
    offset: 0,
  });
  return { prompts };
}

async function fetchMorePrompts(offset: number) {
  const response = await fetch(
    `/api/prompts?offset=${offset}&limit=${ITEMS_PER_PAGE}`
  );
  return response.json();
}

export default function Prompts({ loaderData }: Route.ComponentProps) {
  const [prompts, setPrompts] = useState<Prompt[]>(loaderData.prompts);
  const [offset, setOffset] = useState(ITEMS_PER_PAGE);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          setLoading(true);
          const newPrompts = await fetchMorePrompts(offset);

          if (newPrompts.length === 0) {
            setHasMore(false);
          } else {
            setPrompts((prev) => [...prev, ...newPrompts]);
            setOffset((prev) => prev + ITEMS_PER_PAGE);
          }
          setLoading(false);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [offset, loading, hasMore]);

  return (
    <div className="space-y-4 contain-layout">
      <div className="transform-gpu will-change-auto">
        <AsciiTable prompts={prompts} />
      </div>
      <div ref={observerTarget} className="h-4">
        {loading && (
          <div className="text-center font-tech">Loading more prompts...</div>
        )}
        {!hasMore && !loading && (
          <div className="text-center font-tech text-gray-500 dark:text-gray-400 py-4">
            <div className="ascii-border-simple">
              <div className="p-4">
                <p>+--[ No More Prompts ]--+</p>
                <p className="text-sm mt-2">
                  You've reached the end of the list
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
