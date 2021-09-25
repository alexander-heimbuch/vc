import { Command } from 'commander';
import { SimpleGit } from 'simple-git/promise';
import { propOr } from 'ramda';

import { FILES_STAGE } from '../io/messages';
import stage from '../git/stage';
import { Options } from '../types/command.types';

export default async function (git: SimpleGit, command: Command, options: Options) {
  const files = propOr([], 'args', options)
  return stage(git, files).then(FILES_STAGE);
}
