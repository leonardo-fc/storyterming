import 'zx/globals';

// silence throned error, since zx is already logging it
process.on('unhandledRejection', (err: ProcessOutput) => {
  process.exit(err.exitCode ?? 1);
});

$.cwd = new URL('..', import.meta.url).pathname;

await fs.ensureDir('dist');
await fs.emptyDir('dist');

// build client
await $`vite build`;

// build server
await $`vite build --config vite.node.config.ts`;

// custom package.json to config and prevent `pkg` from including the dependencies
await fs.writeFile(
  'dist/temp/package.json',
  JSON.stringify({
    name: 'storyterming',
    version: '1.0.0',
    bin: 'server/main.cjs',
    pkg: {
      assets: ['client/**/*'],
      outputPath: '..',
      targets: ['node16-linux-x64', 'node16-macos-x64'],
    },
    dependencies: {
      fsevents: '../../node_modules/fsevents',
      chalk: '../../node_modules/chalk',
    },
  }),
);

// create executable
await $`cd dist/temp && pkg .`;

await fs.remove('dist/temp');
