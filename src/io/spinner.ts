import ora from 'ora';

const cliSpinner = ora();

export default async <T>(asyncOperation: Promise<T>, text: string): Promise<T> => {
  if (process.env.NODE_ENV === 'test') {
    return asyncOperation;
  }

  if (text) {
    cliSpinner.text = text;
  }

  cliSpinner.start();

  return new Promise((resolve, reject) => {
    asyncOperation
      .then((result: T) => {
        resolve(result);
        cliSpinner.stop();
      })
      .catch((err: T) => {
        reject(err);
        cliSpinner.stop();
      });
  });
};
