/**
 * Integration test helper
 * Author: Andrés Zorro <zorrodg@gmail.com>
 */

const { existsSync } = require('fs');
const { constants } = require('os');
const path = require('path');
const spawn = require('cross-spawn');
const concat = require('concat-stream');
const { curry } = require('ramda');
const PATH = process.env.PATH;
const TS_NODE = path.resolve(__dirname, '..', 'node_modules', '.bin', 'ts-node');

/**
 * Creates a child process with script path
 * @param {string} processPath Path of the process to execute
 * @param {Array} args Arguments to the command
 * @param {Object} env (optional) Environment variables
 */
const createProcess = curry((processPath, args = [], env = null) => {
  // Ensure that path exists
  if (!processPath || !existsSync(processPath)) {
    throw new Error('Invalid process path');
  }

  args = [processPath].concat(args);

  // This works for node based CLIs, but can easily be adjusted to
  // any other process installed in the system
  return spawn(TS_NODE, args, {
    env: Object.assign(
      {
        NODE_ENV: 'test',
        preventAutoStart: false,
        PATH // This is needed in order to get all the binaries in your current terminal
      },
      env
    ),
    stdio: [null, null, null, 'ipc'] // This enables interprocess communication (IPC)
  });
});

/**
 * Creates a command and executes inputs (user responses) to the stdin
 * Returns a promise that resolves when all inputs are sent
 * Rejects the promise if any error
 * @param {string} processPath Path of the process to execute
 * @param {Array} args Arguments to the command
 * @param {Array} inputs (Optional) Array of inputs (user responses)
 * @param {Object} opts (optional) Environment variables
 */
export const executeWithInput = curry((processPath, args?, inputs?, opts?: { env?: { DEBUG?: boolean }; timeout?: number; maxTimeout?: number }) => {
  if (!Array.isArray(inputs)) {
    opts = inputs;
    inputs = [];
  }

  const { env = null, timeout = 100, maxTimeout = 10000 } = opts;
  const childProcess = createProcess(processPath, args, env);
  childProcess.stdin.setEncoding('utf-8');

  let currentInputTimeout, killIOTimeout;

  // Creates a loop to feed user inputs to the child process in order to get results from the tool
  // This code is heavily inspired (if not blantantly copied) from inquirer-test:
  // https://github.com/ewnd9/inquirer-test/blob/6e2c40bbd39a061d3e52a8b1ee52cdac88f8d7f7/index.js#L14
  const loop = inputs => {
    if (killIOTimeout) {
      clearTimeout(killIOTimeout);
    }

    if (!inputs.length) {
      childProcess.stdin.end();

      // Set a timeout to wait for CLI response. If CLI takes longer than
      // maxTimeout to respond, kill the childProcess and notify user
      killIOTimeout = setTimeout(() => {
        console.error('Error: Reached I/O timeout');
        childProcess.kill(constants.signals.SIGTERM);
      }, maxTimeout);

      return;
    }

    currentInputTimeout = setTimeout(() => {
      childProcess.stdin.write(inputs[0]);
      // Log debug I/O statements on tests
      if (env && env.DEBUG) {
        console.log('input:', inputs[0]);
      }
      loop(inputs.slice(1));
    }, timeout);
  };

  const promise: any = new Promise((resolve, reject) => {
    // Get errors from CLI
    childProcess.stderr.on('data', data => {
      // Log debug I/O statements on tests
      if (env && env.DEBUG) {
        console.log('error:', data.toString());
      }
    });

    // Get output from CLI
    childProcess.stdout.on('data', data => {
      // Log debug I/O statements on tests
      if (env && env.DEBUG) {
        console.log('output:', data.toString());
      }
    });

    childProcess.stderr.once('data', err => {
      childProcess.stdin.end();

      if (currentInputTimeout) {
        clearTimeout(currentInputTimeout);
        inputs = [];
      }
      reject(err.toString());
    });

    childProcess.on('error', reject);

    // Kick off the process
    loop(inputs);

    childProcess.stdout.pipe(
      concat(result => {
        if (killIOTimeout) {
          clearTimeout(killIOTimeout);
        }

        resolve(result.toString());
      })
    );
  });

  // Appending the process to the promise, in order to
  // add additional parameters or behavior (such as IPC communication)
  promise.attachedProcess = childProcess;

  return promise;
});

export const create = () => ({
  execute: executeWithInput(path.resolve(__dirname, '..', 'src', 'vc.ts'))
});

export const DOWN = '\x1B\x5B\x42';
export const UP = '\x1B\x5B\x41';
export const RIGHT = '\x1b\x5b\x43';
export const LEFT = '\x1b\x5b\x44';
export const ENTER = '\x0D';
export const SPACE = '\x20';
export const TAB = '\x09';

// # Here are the various escape sequences we can capture
// # '\x0d': 'return'
// # '\x7f': 'backspace'
// # '\x1b': 'escape'
// # '\x01': 'ctrl+a'
// # '\x02': 'ctrl+b'
// # '\x03': 'ctrl+c'
// # '\x04': 'ctrl+d'
// # '\x05': 'ctrl+e'
// # '\x06': 'ctrl+f'
// # '\x1a': 'ctrl+z'
// # '\x1b\x4f\x50': 'f1'
// # '\x1b\x4f\x51': 'f2'
// # '\x1b\x4f\x52': 'f3'
// # '\x1b\x4f\x53': 'f4'
// # '\x1b\x4f\x31\x35\x7e': 'f5'
// # '\x1b\x4f\x31\x37\x7e': 'f6'
// # '\x1b\x4f\x31\x38\x7e': 'f7'
// # '\x1b\x4f\x31\x39\x7e': 'f8'
// # '\x1b\x4f\x31\x30\x7e': 'f9'
// # '\x1b\x4f\x31\x31\x7e': 'f10'
// # '\x1b\x4f\x31\x33\x7e': 'f11'
// # '\x1b\x4f\x31\x34\x7e': 'f12'
// # '\x1b\x5b\x41': 'up'
// # '\x1b\x5b\x42': 'down'
// # '\x1b\x5b\x43': 'right'
// # '\x1b\x5b\x44': 'left'
// # '\x1b\x4f\x46': 'end'
// # '\x1b\x4f\x48': 'home'
// # '\x1b\x5b\x32\x7e': 'insert'
// # '\x1b\x5b\x33\x7e': 'delete'
// # '\x1b\x5b\x35\x7e': 'pageup'
// # '\x1b\x5b\x36\x7e': 'pagedown'
