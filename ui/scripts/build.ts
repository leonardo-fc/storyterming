import "zx/globals";

// silence throned error, since zx is already logging it
process.on("unhandledRejection", (err: ProcessOutput) => {
  process.exit(err.exitCode ?? 1);
});

$.cwd = new URL("..", import.meta.url).pathname;
$.stdio = ["inherit", "inherit", "inherit"];

await fs.ensureDir("dist");
await fs.emptyDir("dist");

echo("Building client");
await $`vite build`;

echo("Building server");
await $`tsup src/main.ts -d dist/temp/server`;

// custom package.json to config and prevent `pkg` from including the dependencies
await fs.writeFile(
  "dist/temp/package.json",
  JSON.stringify({
    name: "storyterming",
    type: "module",
    version: "1.0.0",
    bin: "server/main.cjs",
    pkg: {
      assets: ["client/**/*", "server/*.node"],
      outputPath: "..",
      targets: ["node22-linux-x64", "node22-macos-x64"],
    },
  }),
);

echo("Packaging executable");
await $`cd dist/temp && pkg .`;

await fs.remove("dist/temp");
