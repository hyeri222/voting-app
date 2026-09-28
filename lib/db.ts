import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let client: NeonQueryFunction<false, false> | null = null;

// Created on first query rather than at import: `next build` imports this module while
// collecting page data, and DATABASE_URL may not be available at build time.
export function db(): NeonQueryFunction<false, false> {
  if (!client) {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
    client = neon(process.env.DATABASE_URL);
  }
  return client;
}
