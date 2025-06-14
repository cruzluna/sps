import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("prompts", "routes/prompts/prompts.tsx"),
	route("prompt/:id", "routes/prompt.$id.tsx"),
	route("dashboard", "routes/dashboard/dashboard.tsx", [
		index("routes/dashboard/dashboard._index.tsx"),
		route("prompts", "routes/dashboard/dashboard.prompts.tsx"),
		route("create", "routes/dashboard/dashboard.create.tsx"),
		route("api-keys", "routes/dashboard/dashboard.api-keys.tsx"),
	]),
	route("docs", "routes/docs/docs.tsx", [
		index("routes/docs/docs._index.tsx"),
		route("getting-started", "routes/docs/getting-started.tsx"),
		route("openapi-spec", "routes/docs/openapi-spec.tsx"),
		route("guides", "routes/docs/guides._index.tsx"),
		route("guides/guide-1", "routes/docs/guides.guide-1.tsx"),
		route("api", "routes/docs/api.tsx", [
			index("routes/docs/api._index.tsx"),
			route("create", "routes/docs/api.create.tsx"),
			route("read", "routes/docs/api.read.tsx"),
			route("update", "routes/docs/api.update.tsx"),
			route("delete", "routes/docs/api.delete.tsx"),
		]),
		route("data-model", "routes/docs/data-model.tsx"),
		route("pricing", "routes/docs/pricing.tsx"),
		route("upcoming-features", "routes/docs/upcoming-features.tsx"),
	]),
	route("api/prompts", "routes/api.prompts.tsx"),
	route("api/promptbyids", "routes/api.promptbyids.tsx"),
	route("*", "routes/catch-all.tsx"),
] satisfies RouteConfig;
