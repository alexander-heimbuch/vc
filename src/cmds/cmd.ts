import { Async, pipe, Result } from '@nozzlegear/railway';
import { Command } from 'commander';
import path from 'path';
import gitP, { SimpleGit } from 'simple-git/promise';
import { Options } from 'src/types/command.types';
const git: SimpleGit = gitP(path.resolve(__dirname, '..', '..', 'test'));

export default function (action: Function) {
  return async (options: Options, command: Command) => {
    const result: Result<any> = await action.apply(this, [git, options, command])

    if (result.isOk()) {
      const output = result.getValue();
      output && console.log(output);
      return process.exit(0);
    }

    if (result.isError()) {
      const error = result.getError();
      console.log(error);
      process.exit(1);
    }
  };
}
