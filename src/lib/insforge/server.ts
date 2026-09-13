import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@insforge/sdk/ssr";

/**
 * Server-only InsForge client bound to the current request's session cookie.
 * Every database call made with this client is scoped by RLS to the signed-in user.
 */
export async function createInsForgeServerClient() {
  return createServerClient({ cookies: await cookies() });
}
