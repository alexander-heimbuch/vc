import { isValidBranchName, selectBranch } from './branch';

jest.mock('execa');
import execa from 'execa';

let autoSuggestConstructor = jest.fn();
let autoSuggestRun = jest.fn();

jest.mock('../io/auto-suggest', () => {
  class AutoSuggest {
    constructor(...args) {
      autoSuggestConstructor.call(null, args);
    }

    run = autoSuggestRun
  }

  return {
    AutoSuggest
  }
});

describe('isValidBranchName()', () => {
  it('should call git with check-ref-format', async () => {
    (execa as any).mockImplementation(() => Promise.resolve());

    await isValidBranchName('branchName');
    expect(execa).toHaveBeenCalledWith('git', ['check-ref-format', '--allow-onelevel', 'branchName'])
  });

  it('should return true on resolve', async () => {
    (execa as any).mockImplementation(() => Promise.resolve());

    const result = await isValidBranchName('branchName');
    expect(result).toBe(true);
  });

  it('should return false on reject', async () => {
    (execa as any).mockImplementation(() => Promise.reject());

    const result = await isValidBranchName('branchName');
    expect(result).toBe(false);
  });
});

describe('selectBranch()', () => {
  describe('fallback', () => {
    it('should return a fallback if it returns a valid branch name', async () => {
      (execa as any).mockImplementation(() => Promise.resolve());

      const result = await selectBranch('test', ['branch', 'list'], {
        fallback: 'my-fallback'
      })

      expect(result).toBe('my-fallback');
    });

    it('should call the prompt if an invalid branch name was provided', async () => {
      (execa as any).mockImplementation(() => Promise.reject());
      autoSuggestRun.mockReturnValue(Promise.resolve(true));
      await selectBranch('test', ['branch', 'list'], {
        fallback: 'my-fallback'
      })

      expect(autoSuggestConstructor).toHaveBeenCalled();
    })
  })

  describe('prompt', () => {
    const args = {
      validate: isValidBranchName,
      inputNoChoice: true,
      limit: 10,
    }

    beforeEach(() => {
      (execa as any).mockImplementation(() => Promise.resolve());
      autoSuggestRun.mockReturnValue(Promise.resolve(true));
    })

    it('should call the prompt with the given name', async () => {
      await selectBranch('test', ['branch', 'list']);
      expect(autoSuggestConstructor).toHaveBeenCalledWith([{
        ...args,
        name: 'test',
        choices: ['', 'branch', 'list'],
        initial: null,
        message: 'test',
      }])
    })

    it('should call the prompt with given branches', async () => {
      await selectBranch('test', ['my', 'branch', 'list']);
      expect(autoSuggestConstructor).toHaveBeenCalledWith([{
        ...args,
        name: 'test',
        choices: ['', 'my', 'branch', 'list'],
        initial: null,
        message: 'test',
      }])
    })

    it('should call the prompt with initial value', async () => {
      await selectBranch('test', ['branch', 'list'], { initial: 'initial' });
      expect(autoSuggestConstructor).toHaveBeenCalledWith([{
        ...args,
        name: 'test',
        choices: ['', 'branch', 'list'],
        initial: 'initial',
        message: 'test',
      }])
    })
  })

  describe('retun value', () => {
    beforeEach(() => {
      (execa as any).mockImplementation(() => Promise.resolve());
    })

    it('should return a selected value', async () => {
      autoSuggestRun.mockReturnValue(Promise.resolve('my-return-value'));
      const value = await selectBranch('test', ['branch', 'list'], { initial: 'initial' });
      expect(value).toBe('my-return-value');
    })

    it('should return null on error', async () => {
      autoSuggestRun.mockReturnValue(Promise.reject('my-return-value'));
      const value = await selectBranch('test', ['branch', 'list'], { initial: 'initial' });
      expect(value).toBe(null);
    })
  });

})
