import 'zx/globals';

// silence throned error, since we are already logging it
process.on('unhandledRejection', (err: ProcessOutput) => {
  process.exit(err.exitCode ?? 1);
});

$.verbose = false;
$.cwd = new URL('..', import.meta.url).pathname;

const args = process.argv.slice(2).join(' ');

const client = $`vite`.stdio('ignore', 'inherit', 'inherit');
client.then(() => process.exit());

const server = $`tsx watch --tsconfig tsconfig.build.json src/server/main.dev.ts ${args}`;

server.stdout.on('data', (data) => {
  process.stdout.write(`${chalk.gray(`[Server log]:`)} ${data}`);
});
server.stderr.on('data', (data) => {
  process.stderr.write(`${chalk.red(`[Server error]:`)} ${data}`);
});
