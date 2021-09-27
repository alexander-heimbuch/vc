import execa from 'execa';
import { SimpleGit } from 'simple-git';
import { identity } from 'ramda';
import spinner from '../io/spinner';
import { AutoSuggest } from '../io/auto-suggest';

export const isValidBranchName = (branch: string) =>
  execa('git', ['check-ref-format', '--allow-onelevel', branch])
    .then(() => true)
    .catch(() => false);

export const selectBranch = async (
  name: string,
  branches: string[],
  options?: { fallback?: string; initial?: string }
): Promise<string> => {
  if (options && options.fallback && (await isValidBranchName(options.fallback))) {
    return Promise.resolve(options.fallback);
  }

  const prompt = new AutoSuggest({
    name,
    initial: options ? options.initial : null,
    message: name,
    limit: 10,
    validate: isValidBranchName,
    inputNoChoice: true,
    choices: ['', ...branches],
  });

  return prompt.run().catch(() => null);
};

export const branchList = async (git: SimpleGit) => {
  const fetch = git.fetch().then(() => git.branch());
  return spinner(fetch, 'fetching branches').then(({ all }) => all);
};
