import chalk from 'chalk';
import { Result } from '@nozzlegear/railway';
import { StatusResult } from 'simple-git/promise';

export const FILES_STAGE = (input: Result<string[]>) => {
  const files = input.getValue();

  if (files.length > 1) {
    return Result.ofValue(`${chalk.green('✓')} Staged ${files.length} files`);
  }

  if (files.length === 1) {
    return Result.ofValue(`${chalk.green('✓')} Staged ${chalk.bold(files[0])}`);
  }

  return Result.ofValue(`Nothing staged`);
}

export const FILES_COMMITED = (input: Result<string[]>): Result<string> => {
  const files = input.getValue();

  if (files.length > 1) {
    return Result.ofValue(`${chalk.green('✓')} Commited changes in ${files.length} files`);
  }

  if (files.length === 1) {
    return Result.ofValue(`${chalk.green('✓')} Commited changes to ${chalk.bold(files[0])}`);
  }

  return Result.ofValue(`No changes commited`);
}

export const FILE_SELECT = (status: Result<StatusResult>, input: Result<string>): Result<string> => {
  const { created, modified, deleted, renamed, not_added } = status.getValue();
  const file = input.getValue();

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

  return input;
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
