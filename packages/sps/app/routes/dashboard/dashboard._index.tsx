import { redirect } from "react-router";

// Redirect /dashboard route to /dashboard/prompts
export function loader() {
	return redirect("/dashboard/prompts");
}

export default function DashboardIndex() {
	// This component should never render due to the redirect
	return null;
}
