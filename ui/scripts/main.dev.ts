import "zx/globals";

// silence throned error, since we are already logging it
process.on("unhandledRejection", (err: ProcessOutput) => {
  process.exit(err.exitCode ?? 1);
});

$.verbose = false;
$.cwd = new URL("..", import.meta.url).pathname;
$.stdio = ["inherit", "inherit", "inherit"];

const args = process.argv.slice(2).join(" ");

const client = $`vite`.stdio("ignore", "inherit", "inherit");
void client.finally(() => process.exit());

const server = $`tsx watch src/server/main.dev.ts ${args}`;
void server.finally(() => process.exit());
