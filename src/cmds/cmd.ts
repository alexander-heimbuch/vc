import { Result } from '@nozzlegear/railway';
import gitP, { SimpleGit } from 'simple-git/promise';
import { Options } from '../types/command.types';
import { workingDir } from '../helper/env';

const git: SimpleGit = gitP(workingDir);

export default function (action: Function) {
  return async (args: string, options: Options) => {
    try {
      const result: Result<any> = await action.apply(this, [git, args, options || {}]);

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
    } catch (err) {
      console.log(err);
      process.exit(1);
    }
  };
}
