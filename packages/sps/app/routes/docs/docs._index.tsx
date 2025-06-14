import { redirect } from "react-router";

// Redirect /docs route to /docs/getting-started
export function loader() {
	return redirect("/docs/getting-started");
}

export default function DocsIndex() {
	// This component should never render due to the redirect
	return null;
}
