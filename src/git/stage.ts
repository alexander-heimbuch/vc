import { Result } from '@nozzlegear/railway';
import { SimpleGit } from 'simple-git/promise';
import spinner from '../io/spinner';
import { FILE_SELECT } from '../io/messages'

const { AutoComplete } = require('enquirer');

export const select = async (git: SimpleGit): Promise<Result<string[]>> => {
  const status = await spinner(git.status(), 'fetching changed files');

  if (status.files.length === 0) {
    return Promise.resolve(Result.ofValue([]));
  }

  const prompt = new AutoComplete({
    name: 'files',
    message: 'Select Files',
    multiple: true,
    initial: status.staged,
    choices: status.files
      .map((file) => file.path)
      .map((file) => ({
        message: FILE_SELECT(Result.ofValue(status), Result.ofValue(file)).getValue(),
        value: file,
        name: file
      })),
  });

  return Result.ofPromise(prompt.run());
};

export const add = (git: SimpleGit) => async (files: Result<string[]>) => {
  await spinner(
    git.reset().then(() => git.add(files.getValue())),
    'staging files'
  );
  const status = await spinner(git.status(), 'fetching staged files');

  return Result.ofValue(status.staged);
};

export default (git: SimpleGit) => (files: string[]) =>
  (files.length > 0 ? Promise.resolve(Result.ofValue(files)) : select(git)).then(add(git));
