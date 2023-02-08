import { createTRPCClient, createWSClient, wsLink } from "@trpc/client";
import type { AppRouter } from "~/server/router";

const isDev = import.meta.env.DEV;

const wsClient = createWSClient({
  url: `ws://localhost:${(isDev ? 6005 : 6006).toString()}`,
});

export const api = createTRPCClient<AppRouter>({
  links: [wsLink({ client: wsClient })],
});
