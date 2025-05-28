import type { Route } from "./+types/api.prompts";

export async function loader({ request }: Route.LoaderArgs) {
  const { getPrompts } = await import("~/.server/system-prompt");
  const url = new URL(request.url);
  const offset = parseInt(url.searchParams.get("offset") || "0");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  //   const category = url.searchParams.get("category") || "react";

  const prompts = await getPrompts({ offset, limit });
  return new Response(JSON.stringify(prompts), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
