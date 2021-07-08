import execa from 'execa';
import { SimpleGit } from 'simple-git';
import spinner from '../io/spinner';
import { AutoSuggest } from '../io/auto-suggest';

export const isValidBranchName = (branch: string) =>
  execa('git', ['check-ref-format', '--allow-onelevel', branch])
    .then(() => true)
    .catch(() => false);

export const selectBranch = async (
  name: string,
  branches: string[],
  { fallback, initial }: { fallback?: string; initial?: string }
): Promise<string> => {
  if (fallback && isValidBranchName(fallback)) {
    return Promise.resolve(fallback);
  }

  const prompt = new AutoSuggest({
    name,
    initial,
    message: name,
    limit: 10,
    validate: isValidBranchName,
    inputNoChoice: true,
    choices: ['', ...branches],
  });

  return prompt.run().catch(() => null);
};

export const branchList = async (git: SimpleGit) =>
  spinner(git.branch(), 'fetching branches').then(({ all }) => all.map((branch) => branch.replace('remotes/', '')));
