import { makeRouteHandler } from "@keystatic/next/route-handler";
import config, { isGitHubMode } from "../../../../../keystatic.config";

// Local mode writes to the filesystem, which a deployed Worker doesn't have,
// so the API is disabled in production unless GitHub mode is configured.
const disabled = process.env.NODE_ENV === "production" && !isGitHubMode;

const notFound = () => new Response("Not found", { status: 404 });

// Created on the first request rather than at import, because Keystatic reads
// the GitHub secrets when the handler is made. They exist on the running
// Worker but not during the build.
let handler: ReturnType<typeof makeRouteHandler> | undefined;
const getHandler = () => (handler ??= makeRouteHandler({ config }));

export function GET(request: Request) {
  return disabled ? notFound() : getHandler().GET(request);
}

export function POST(request: Request) {
  return disabled ? notFound() : getHandler().POST(request);
}
