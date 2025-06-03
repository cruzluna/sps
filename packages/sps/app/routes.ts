import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("prompts", "routes/prompts/prompts.tsx"),
  route("prompt/:id", "routes/prompt.$id.tsx"),
  route("docs", "routes/docs/docs.tsx", [
    index("routes/docs/docs._index.tsx"),
    route("getting-started", "routes/docs/getting-started.tsx"),
    route("guides", "routes/docs/guides._index.tsx"),
    route("guides/guide-1", "routes/docs/guides.guide-1.tsx"),
  ]),
  route("api/prompts", "routes/api.prompts.tsx"),
  route("*", "routes/catch-all.tsx"),
] satisfies RouteConfig;
