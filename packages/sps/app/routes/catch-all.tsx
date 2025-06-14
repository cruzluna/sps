import type { Route } from "./+types/catch-all";

export async function loader({ request }: Route.LoaderArgs) {
	// Return a 404 response for any unmatched routes
	return new Response(null, { status: 404 });
}
