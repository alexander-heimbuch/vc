#! /usr/bin/env node
"use strict";

import cli from "commander";
const { version } = require("../package");

import command from './cmds/cmd';
import stage from './cmds/stage';
import commit from './cmds/commit';
import branch from './cmds/branch';

import { collect } from "./io/options";

cli
  .version(version, "-v --version", "output the current version")
  .description("user focused version control");

cli
  .command('stage')
  .description('stage files for commit')
  .action(command(stage));

cli
  .command('commit')
  .description('commit file')
  .option('-m, --message <message>', 'commit message', collect, [])
  .option('-a, --amend', 'amend to latest commit', false)
  .action(command(commit));

cli
  .command('branch [name]')
  .description('checkout a branch')
  .option('-r, --remote <remoteBranch>', 'remote branch')
  .action(command(branch));


// error on unknown commands
cli.on("command:*", function () {
  console.error(
    "invalid command: %s\nSee --help for a list of available commands.",
    cli.args.join(" ")
  );
  process.exit(1);
});

cli.parse(process.argv);
