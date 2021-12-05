import { Result } from '@nozzlegear/railway';
import { SimpleGit } from 'simple-git/promise';
import { propOr } from 'ramda';

import spinner from '../io/spinner';
import { Options } from '../types/command.types';
import { COMMITED, FILES_COMMITED } from '../io/messages';
import stage from '../git/stage';

const { Input } = require('enquirer');

const queryCommitMessage = (message: string[]): Promise<string> => {
  return new Input({
    message: 'Commit message:',
    initial: message.join('\n'),
    multiline: true,
  }).run();
};

export default async function (git: SimpleGit, options: Options, args: Options): Promise<Result<string>> {
  const files = await spinner(git.status(), 'getting staged files')
    .then(({ staged }) => staged)
    .then(stage(git));

  let initialMessage;

  const commitMessage = propOr([], 'message', options).join('\n');

  switch (true) {
    case options.amend: {
      const { latest } = await spinner(git.log(), 'fetching history');
      initialMessage = [latest.message];
      break;
    }

    default: {
      initialMessage = [];
    }
  }

  const commitOptions = {};
  switch (true) {
    case !!options.amend: {
      commitOptions['--amend'] = null;
      break;
    }
  }

  const message = commitMessage ? commitMessage : await queryCommitMessage(initialMessage);

  if (files.length > 0) {
    await spinner(git.commit(message, files, commitOptions), 'Commiting staged files');
    return FILES_COMMITED(files);
  } else {
    await spinner(git.commit(message, commitOptions), 'Commiting staged files');
    return COMMITED();
  }
}
