import http from "node:http";
import "./cli";
import { startWsServer } from "./server";
import { startWatch } from "./watch";

export function startServerSide(httpServer: http.Server) {
  startWsServer(httpServer);
  startWatch();
}
