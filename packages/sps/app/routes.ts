import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("prompts", "routes/prompts/prompts.tsx"),
  route("docs", "routes/docs/docs.tsx"),
  route("api/prompts", "routes/api.prompts.tsx"),
  route("*", "routes/catch-all.tsx"),
] satisfies RouteConfig;
