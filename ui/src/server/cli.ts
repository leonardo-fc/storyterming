import { fail } from "node:assert";
import { program } from "commander";

program.name("storyterming").arguments(`<snapshotsDir>`).parse();

export const args = {
  snapshotsDir: process.argv[2] ?? fail(),
};
