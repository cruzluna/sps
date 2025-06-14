import type { Route } from "./+types/api.prompts";

export async function loader({ request }: Route.LoaderArgs) {
	const { getPrompts } = await import("~/.server/system-prompt");
	const url = new URL(request.url);
	const offset = Number.parseInt(url.searchParams.get("offset") || "0");
	const limit = Number.parseInt(url.searchParams.get("limit") || "20");
	const category = url.searchParams.get("category");

	const params: { offset: number; limit: number; category?: string } = {
		offset,
		limit,
	};

	if (category) {
		params.category = category;
	}

	const prompts = await getPrompts(params);
	return new Response(JSON.stringify(prompts), {
		headers: {
			"Content-Type": "application/json",
		},
	});
}
