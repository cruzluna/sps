import { useEffect, useRef, useState } from "react";
import type { Route } from "./+types/prompts";
import AsciiTable from "~/wrapper-components/ascii-table";
import type { Prompt } from "system-prompt-storage/resources/prompts";
import { useFetcher } from "react-router";

const ITEMS_PER_PAGE = 12;

export async function loader({}: Route.LoaderArgs) {
  const { getPrompts } = await import("~/.server/system-prompt");
  const prompts = await getPrompts({
    limit: ITEMS_PER_PAGE,
    offset: 0,
  });
  return { prompts };
}

export default function Prompts({ loaderData }: Route.ComponentProps) {
  const [prompts, setPrompts] = useState<Prompt[]>(loaderData.prompts);
  const fetcher = useFetcher<Prompt[]>();
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fetcher.data && Array.isArray(fetcher.data)) {
      if (fetcher.data.length === 0) {
        setHasMore(false);
      } else {
        setPrompts((prev) => [...prev, ...fetcher.data!]);
      }
    }
  }, [fetcher.data]);

  function loadMore() {
    fetcher.load(
      `/api/prompts?offset=${prompts.length}&limit=${ITEMS_PER_PAGE}`
    );
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && fetcher.state === "idle" && hasMore) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [prompts.length, fetcher.state, hasMore]);

  const isLoading = fetcher.state === "loading";

  return (
    <div className="space-y-4 contain-layout">
      <div className="transform-gpu will-change-auto">
        <AsciiTable prompts={prompts} />
      </div>
      <div ref={observerTarget} className="h-4">
        {isLoading && (
          <div className="text-center font-tech">Loading more prompts...</div>
        )}
        {!hasMore && !isLoading && (
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
