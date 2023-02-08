import http from 'node:http';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import { WebSocketServer } from 'ws';
import { appRouter } from './router';

export function startWsServer(httpServer: http.Server) {
  const wss = new WebSocketServer(
    httpServer ? { server: httpServer } : { port: 3000, host: 'localhost' },
  );

  const handler = applyWSSHandler({ wss, router: appRouter });

  process.on('SIGTERM', () => {
    handler.broadcastReconnectNotification();
    httpServer.close();
  });
}
