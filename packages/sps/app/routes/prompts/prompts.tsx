import { useEffect, useRef, useState } from "react";
import type { Route } from "./+types/prompts";
import AsciiTable from "~/wrapper-components/ascii-table";
import type { Prompt } from "system-prompt-storage/resources/prompts";
import { useFetcher } from "react-router";

const ITEMS_PER_PAGE = 12;

export async function loader({}: Route.LoaderArgs) {
  const { getPrompts, getPromptCategories } = await import(
    "~/.server/system-prompt"
  );

  const [prompts, categories] = await Promise.all([
    getPrompts({
      limit: ITEMS_PER_PAGE,
      offset: 0,
    }),
    getPromptCategories(),
  ]);

  return { prompts, categories };
}

export default function Prompts({ loaderData }: Route.ComponentProps) {
  const [prompts, setPrompts] = useState<Prompt[]>(loaderData.prompts);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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
    const params = new URLSearchParams({
      offset: prompts.length.toString(),
      limit: ITEMS_PER_PAGE.toString(),
    });

    if (selectedCategory) {
      params.set("category", selectedCategory);
    }

    fetcher.load(`/api/prompts?${params.toString()}`);
  }

  function handleCategoryChange(category: string | null) {
    setSelectedCategory(category);
    setPrompts([]);
    setHasMore(true);

    const params = new URLSearchParams({
      offset: "0",
      limit: ITEMS_PER_PAGE.toString(),
    });

    if (category) {
      params.set("category", category);
    }

    fetcher.load(`/api/prompts?${params.toString()}`);
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      {/* Category Filter */}
      <div className="sticky top-0 bg-white dark:bg-gray-950 py-2 z-10 flex flex-wrap gap-2 items-center justify-between font-tech">
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => handleCategoryChange(null)}
            className={`px-3 py-1 text-sm transition-colors ${
              selectedCategory === null
                ? "font-bold"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            All
          </button>
          {loaderData.categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-3 py-1 text-sm transition-colors ${
                selectedCategory === category
                  ? "font-bold"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <button
          onClick={scrollToTop}
          className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          scroll to top^
        </button>
      </div>

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
