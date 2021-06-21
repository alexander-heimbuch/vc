import { Result } from '@nozzlegear/railway';
import { Command } from 'commander';
import { SimpleGit } from 'simple-git/promise';

import spinner from '../io/spinner'
import { Options } from '../types/command.types';
import { FILES_COMMITED } from '../io/messages';
import stage from '../git/stage';

const { Input } = require('enquirer');

const commitMessage = (message: string[]): Promise<Result<string>> => {
  return new Input({
    message: 'Commit message:',
    initial: message.join('\n'),
    multiline: true
  }).run().then(result => Result.ofValue(result));
}

export default async function (git: SimpleGit, options: Options, command: Command) {
  const files = await spinner(git.status(), 'getting staged files').then(({ staged }) => staged).then(stage(git));

  let initialMessage;

  switch (true) {
    case options.message.length > 0: {
      initialMessage = options.message;
      break;
    }

    case options.amend: {
      const { latest } = await spinner(git.log(), 'fetching history');
      initialMessage = [latest.message];
      break;
    }

    default: {
      initialMessage = [];
    }
  }

  let commitOptions;
  switch (true) {
    case !!options.amend: {
      commitOptions = '--amend'
      break;
    }

    default: {
      commitOptions = '';
    }
  }

  const message = await commitMessage(initialMessage);
  await spinner(git.commit(message.getValue(), files.getValue(), commitOptions), 'Commiting staged files');

  return FILES_COMMITED(files);
}
