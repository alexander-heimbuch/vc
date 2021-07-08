import { Result } from '@nozzlegear/railway';
import path from 'path';
import gitP, { SimpleGit } from 'simple-git/promise';
import { Options } from 'src/types/command.types';
const git: SimpleGit = process.env.TEST_DIR ? gitP(path.resolve(process.env.TEST_DIR)) : gitP();

export default function (action: Function) {
  return async (args: string, options: Options) => {
    const result: Result<any> = await action.apply(this, [git, args, options || {}])

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
