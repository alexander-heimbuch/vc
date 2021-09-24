import { Result } from '@nozzlegear/railway';
import { SimpleGit } from 'simple-git';
import humnanInterval from 'human-interval';
import spinner from '../io/spinner';
import { HISTORY_EMPTY, HISTORY_ENTRY, STATUS_FORMAT } from '../io/messages';
import { condList } from '../helper/data';
import { Options } from '../types/command.types';

const { Select } = require('enquirer');

const formatter = (history) =>
  history.all.map((entry) => ({
    name: entry.hash,
    message: HISTORY_ENTRY(history.latest, entry),
  }));

const getCommit = async (git: SimpleGit, options: Options, args: string) => {
  if (options.commit) {
    return Promise.resolve(options.commit);
  }

  const logOptions = condList(
    '-p',
    `--max-count=${options.count}`,
    {
      value: `--author=${options.author}`,
      cond: !!options.author,
    },
    {
      value: () => {
        const relative = humnanInterval(options.since);

        if (relative) {
          return `--since=${new Date(Date.now() - relative).toUTCString()}`;
        }

        return `--since=${options.since}`;
      },
      cond: !!options.since,
    },
    {
      value: () => {
        const relative = humnanInterval(options.before);

        if (relative) {
          return `--before=${new Date(Date.now() - relative).toUTCString()}`;
        }

        return `--before=${options.before}`;
      },
      cond: !!options.before,
    },
    {
      value: `--grep=${options.query}`,
      cond: !!options.query,
    },
    {
      value: args,
      cond: !!args,
    }
  );

  const history = await spinner(git.log(logOptions), 'fetching history');

  if (history.total === 0) {
    throw new Error('HISTORY_EMPTY');
  }

  const prompt = new Select({
    promptLine: false,
    name: 'commit',
    limit: 10,
    styles: {
      em: (msg) => msg,
    },
    choices: formatter(history),
  });

  return prompt.run();
};

export default async function (git: SimpleGit, args: string, options: Options): Promise<Result<any>> {
  try {
    const commit = await getCommit(git, options, args);
    const status = await git.show(['--stat', `--pretty=${STATUS_FORMAT}`, commit]);

    return Result.ofValue(status);
  } catch (err) {
    return Result.ofError(HISTORY_EMPTY());
  }
}
