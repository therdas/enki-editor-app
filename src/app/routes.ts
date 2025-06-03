import {
  type RouteConfig,
  route,
} from "@react-router/dev/routes";

export default [
  route("/", "./App.tsx"),
  // pattern ^           ^ module file
] satisfies RouteConfig;