FROM cimg/rust:1.67.0-node

RUN cargo --version; \
  rustup update; \
  rustup component add clippy; \
  corepack enable --install-directory ~/bin
