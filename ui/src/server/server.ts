import http from "node:http";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { WebSocketServer } from "ws";
import { appRouter } from "./router";

export function startWsServer(server: http.Server) {
  const wss = new WebSocketServer({ server });

  const handler = applyWSSHandler({ wss, router: appRouter });

  process.on("SIGTERM", () => {
    handler.broadcastReconnectNotification();
    server.close();
  });
}
