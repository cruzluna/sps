import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("prompts", "routes/prompts/prompts.tsx"),
  route("docs", "routes/docs/docs.tsx"),
] satisfies RouteConfig;
