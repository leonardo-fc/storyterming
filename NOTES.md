# Packages

This repo consists of:

- The core library, on root folder.
- The libraries for different languages, on clients folder. They are thin wrappers of the core.
- The dashboard, on dashboard folder. Distributed as a self-contained executable.

[streetsidesoftware/cspell-action](https://github.com/streetsidesoftware/cspell-action) is not following the config, so it's commented out in the [ci](https://github.com/leonardo-fc/storyterming/blob/main/.github/workflows/ci.yml) and cspell cli is being used instead.

VS Code does not support yet multiple devcontainer.json in the same repo for clone in volume. So I'm using a single devcontainer in the meantime.
Issue: [microsoft/vscode-remote-release#7879](https://github.com/microsoft/vscode-remote-release/issues/7879)

# Core

# Clients

# Dashboard

- Node.js version is 16.16.0 to match the latest LTS version available on [pkg](https://github.com/vercel/pkg), see current versions [here](https://github.com/vercel/pkg-fetch/releases).
