import { startServerSide } from './main';
import { createServer } from 'node:http';

const httpServer = createServer();

startServerSide(httpServer);

const port = 3000;
const host = 'localhost';

httpServer.listen(port, host).on('listening', () => {
  console.log(`Server started`);
});
