import { createServer } from 'node:http';
import serveStatic from 'serve-static';
import finalhandler from 'finalhandler';
import chalk from 'chalk';
import { startServerSide } from '~/server/main';

const clientUrl = new URL('.', import.meta.url).pathname; // cwd will be dist/temp/server

const serve = serveStatic(clientUrl);

const httpServer = createServer((req, res) => {
  serve(req, res, finalhandler(req, res));
});

startServerSide(httpServer);

const port = 3000;
const host = 'localhost';

httpServer.listen(port, host).on('listening', () => {
  const startedOn = chalk.dim(`Dashboard started on`);
  const url = chalk.cyan(`http://${host}:${chalk.bold(port)}`);

  console.log(`${startedOn} ${url}`);
});
