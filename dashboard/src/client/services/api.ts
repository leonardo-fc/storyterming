import { createTRPCProxyClient, createWSClient, wsLink } from '@trpc/client';
import type { AppRouter } from '~/server/router';

const wsClient = createWSClient({
  url: `ws://localhost:3000`,
});

export const api = createTRPCProxyClient<AppRouter>({
  links: [wsLink({ client: wsClient })],
});
