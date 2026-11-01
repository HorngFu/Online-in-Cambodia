import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "../../keystatic.config";

// Reads content files from disk. Only call this from code that runs at build
// time (statically generated pages): the Cloudflare Worker has no filesystem.
export const reader = createReader(process.cwd(), keystaticConfig);
