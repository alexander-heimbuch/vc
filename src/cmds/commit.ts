import { Result } from '@nozzlegear/railway';
import { SimpleGit } from 'simple-git/promise';
import { propOr } from 'ramda';

import spinner from '../io/spinner';
import { Options } from '../types/command.types';
import { FILES_COMMITED } from '../io/messages';
import stage from '../git/stage';

const { Input } = require('enquirer');

const commitMessage = (message: string[]): Promise<string> => {
  return new Input({
    message: 'Commit message:',
    initial: message.join('\n'),
    multiline: true,
  }).run();
};

export default async function (git: SimpleGit, args: string, options: Options): Promise<Result<string>> {
  const files = await spinner(git.status(), 'getting staged files')
    .then(({ staged }) => staged)
    .then(stage(git));

  let initialMessage;

  switch (true) {
    case propOr([], 'messages', options).length > 0: {
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
      commitOptions = '--amend';
      break;
    }

    default: {
      commitOptions = '';
    }
  }

  const message = await commitMessage(initialMessage);
  await spinner(git.commit(message, files, commitOptions), 'Commiting staged files');

  return FILES_COMMITED(files);
}
