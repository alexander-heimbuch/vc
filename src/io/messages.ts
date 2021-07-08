import { format, formatDistance, formatRelative, subDays } from 'date-fns'
import chalk from 'chalk';
import { Result } from '@nozzlegear/railway';
import { StatusResult } from 'simple-git/promise';

export const FILES_STAGE = (input: string[]) => {
  const files = input;

  if (files.length > 1) {
    return Result.ofValue(`${chalk.green('✓')} Staged ${files.length} files`);
  }

  if (files.length === 1) {
    return Result.ofValue(`${chalk.green('✓')} Staged ${chalk.bold(files[0])}`);
  }

  return Result.ofValue(`Nothing staged`);
}

export const FILES_COMMITED = (input: string[]): Result<string> => {
  const files = input;

  if (files.length > 1) {
    return Result.ofValue(`${chalk.green('✓')} Commited changes in ${files.length} files`);
  }

  if (files.length === 1) {
    return Result.ofValue(`${chalk.green('✓')} Commited changes to ${chalk.bold(files[0])}`);
  }

  return Result.ofValue(`No changes commited`);
}

export const FILE_SELECT = (status: StatusResult, input: string): Result<string> => {
  const { created, modified, deleted, renamed, not_added } = status;
  const file = input;

  if (not_added.includes(file) || created.includes(file)) {
    return Result.ofValue(chalk.green(file));
  }

  if (modified.includes(file)) {
    return Result.ofValue(chalk.italic(file));
  }

  if (deleted.includes(file)) {
    return Result.ofValue(chalk.red(file));
  }

  const renamedFile = renamed.find(renamedFile => renamedFile.to === file);

  if (renamedFile) {
    return Result.ofValue(chalk.italic(`${renamedFile.from} ➡ ${renamedFile.to}`));
  }

  return Result.ofValue(input);
}

export const SWITCH_BRANCH = (branch: string) => {
  return Result.ofValue(`${chalk.green('✓')} Switchted to branch ${chalk.bold(branch)}`);
}

export const CHECKOUT_BRANCH = (branch: string, remote?: string) => {
  if (remote) {
    return Result.ofValue(`${chalk.green('✓')} Checked out branch ${chalk.bold(branch)} → ${remote}`);
  }

  return Result.ofValue(`${chalk.green('✓')} Checked out branch ${chalk.bold(branch)}`);
}

export const HISTORY_ENTRY = (latest: any, entry: any) => [
`${chalk.cyan(entry.hash.substring(0, 7))} - ${entry.message}`,
`${chalk.green('(' + formatDistance(new Date(entry.date), new Date()) + ')')}`,
...(entry.diff ? [`[${chalk.green('+' + entry.diff.insertions)} ${chalk.red('-' + entry.diff.deletions)}]`] : []),
...(entry.hash === latest.hash ? [chalk.yellow(`<${latest.refs}>`)] : [])
].join(' ');

export const STATUS_FORMAT = `
${chalk.magenta('%an <%ae>')}
${chalk.green('%ar')} ${chalk.dim('(%aD)')}

${chalk.bold('%s')}
%b`

export const HISTORY_EMPTY = () => `${chalk.red('⨯')} No entries found`;

export const PUSH_SUCCESSFULL = (branch: string, remote: string) => `${chalk.green('✓')} Pushed ${chalk.bold(branch)} → ${chalk.bold(remote)}`;
export const PUSH_FAILED = (err: string) => `${chalk.red('⨯')} Push failed

${err}
`;

export const MERGE_SUCCESSFULL = (current: string, destination: string) => `${chalk.green('✓')} Merged ${chalk.bold(destination)} → ${chalk.bold(current)}`;

export const STASH_CHANGES = () => `${chalk.green('✓')} Stashed current changes`;
export const APPLY_CHANGES = (branch: string) => `${chalk.green('✓')} Applied stashed changes to branch ${chalk.bold(branch)}`;
