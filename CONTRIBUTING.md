# Setup

The recommended way is to develop in a docker container.

## VS Code Dev Containers

If you use [VS Code](https://code.visualstudio.com/), you can install the [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension.

Once installed you will be prompted to reopen the folder in a container. If you're not prompted, you can run the `Dev Containers: Open Folder in Container` command from the [VS Code Command Palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette).

Needs [Docker](https://www.docker.com/) installed.

## Dev Containers CLI

If you use another editor, you can use the Dev Containers CLI.

```sh
npm install -g @devcontainers/cli
```

Start a dev container (Needs [Docker](https://www.docker.com/) installed).

```sh
devcontainer up --workspace-folder .
```

Now you can open your editor on the working directory normally
and run commands in the container.

```sh
devcontainer exec --workspace-folder . <command>
```

## Alternative

If you're not able to use a dev container, follow these instructions:

### To develop the core

- Install [Rust](https://www.rust-lang.org/tools/install).

### To develop the UI

- Install Node version 16.16.0.
- Install [pnpm](https://pnpm.io/installation).
- Run `pnpm install` on ui folder.
