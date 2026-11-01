import { makeRouteHandler } from "@keystatic/next/route-handler";
import config, { isGitHubMode } from "../../../../../keystatic.config";

// Local mode writes to the filesystem, which a deployed Worker doesn't have,
// so the API is disabled in production until GitHub mode is configured.
const disabled = process.env.NODE_ENV === "production" && !isGitHubMode;

const notFound = () => new Response("Not found", { status: 404 });

export const { POST, GET } = disabled
  ? { POST: notFound, GET: notFound }
  : makeRouteHandler({ config });
