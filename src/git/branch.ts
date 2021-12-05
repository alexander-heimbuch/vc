import execa from 'execa';
import { SimpleGit } from 'simple-git';
import spinner from '../io/spinner';
import { AutoSuggest } from '../io/auto-suggest';
import { fetch } from '../git/fetch'

export const isValidBranchName = (allowEmpty: boolean = false) => (branch: string) => {
  if (allowEmpty && branch === '') {
    return Promise.resolve(true)
  }

  return execa('git', ['check-ref-format', '--allow-onelevel', branch])
  .then(() => true)
  .catch(() => false);
}

export const selectBranch = async (
  name: string,
  branches: string[],
  options?: { fallback?: string; initial?: string, allowEmpty?: boolean }
): Promise<string> => {
  if (options && options.fallback && (await isValidBranchName(options.allowEmpty)(options.fallback))) {
    return Promise.resolve(options.fallback);
  }

  const prompt = new AutoSuggest({
    name,
    initial: options ? options.initial : null,
    message: name,
    limit: 10,
    validate: isValidBranchName(options.allowEmpty),
    inputNoChoice: true,
    choices: ['', ...branches],
  });

  return prompt.run().catch(() => null);
};

export const branchList = async (git: SimpleGit) =>
  spinner(
    fetch(git).then(() => git.branch()),
    'fetching branches'
  ).then(({ all }) => all);

