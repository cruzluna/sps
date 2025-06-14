import type { Route } from "./+types/api.promptbyids";

export async function loader({ request }: Route.LoaderArgs) {
	const { getPrompt } = await import("~/.server/system-prompt");
	const url = new URL(request.url);

	console.log("Received request for prompts by IDs:", url.toString());

	// Get the comma-separated list of IDs
	const idsParam = url.searchParams.get("ids");
	console.log("IDs param:", idsParam);

	if (!idsParam) {
		console.log("No IDs provided in the request");
		return new Response(JSON.stringify({ error: "No IDs provided" }), {
			status: 400,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	try {
		// Split IDs and filter out empty strings
		const ids = idsParam
			.split(",")
			.filter(Boolean)
			.map((id) => id.trim());
		console.log("Parsed IDs:", ids);

		if (ids.length === 0) {
			console.log("No valid IDs found after parsing");
			return new Response(JSON.stringify([]), {
				headers: {
					"Content-Type": "application/json",
				},
			});
		}

		// Fetch all prompts in parallel
		const promptPromises = ids.map((id) => getPrompt(id));
		const prompts = await Promise.all(promptPromises);
		console.log(`Successfully fetched ${prompts.length} prompts`);

		return new Response(JSON.stringify(prompts), {
			headers: {
				"Content-Type": "application/json",
			},
		});
	} catch (error) {
		console.error("Error fetching prompts by IDs:", error);
		return new Response(JSON.stringify({ error: "Failed to fetch prompts" }), {
			status: 500,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}
}
