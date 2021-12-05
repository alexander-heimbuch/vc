import * as cmd from '../../testing/cmd';
import * as repo from '../../testing/repo';
import * as content from '../../testing/content';

describe('commit', () => {
  let testRepo;
  let vc;
  let execute;

  beforeEach(async () => {
    testRepo = await repo.init();
    vc = cmd.create();

    execute = async (args = [], inputs = []) =>
      vc.execute(
        args, // args
        inputs, // inputs
        { env: { VC_GIT_DIR: testRepo.dir.path } } // options
      );

    await repo.branch(testRepo, 'test-branch-1');
  });

  afterEach(() => {
    testRepo.dir.cleanup();
  });

  describe('staged files', () => {
    it('should ask to stage files', async () => {
      await repo.file(testRepo, { path: 'example.md', content: content.example1 });
      const result = await execute(['commit']);
      expect(result).toContain('example.md');
      expect(result).not.toContain('Commit message:');
    });

    it('should stage files', async () => {
      await repo.file(testRepo, { path: 'example.md', content: content.example1 });
      const result = await execute(['commit'], [cmd.SPACE, cmd.ENTER]);
      expect(result).toContain('example.md');
      expect(result).toContain('Commit message:');
    });

    it('should use already staged files', async () => {
      await repo.file(testRepo, { path: 'example.md', content: content.example1 });
      await repo.add(testRepo, ['example.md']);
      const result = await execute(['commit']);
      expect(result).not.toContain('example.md');
    });
  });

  describe('commit message', () => {
    it('should allow to enter a commit message', async () => {
      await repo.file(testRepo, { path: 'example.md', content: content.example1 });
      await repo.add(testRepo, ['example.md']);
      const result = await execute(['commit'], ['my commit message']);
      expect(result).toContain('my commit message');
    });

    it('should allow to enter a multi line commit message', async () => {
      await repo.file(testRepo, { path: 'example.md', content: content.example1 });
      await repo.add(testRepo, ['example.md']);
      const result = await execute(['commit'], ['first line commit message', cmd.ENTER, 'second line commit message']);
      expect(result).toContain('first line commit message');
      expect(result).toContain('second line commit message');
    });

    it('should use the provided commit message', async () => {
      await repo.file(testRepo, { path: 'example.md', content: content.example1 });
      await repo.add(testRepo, ['example.md']);
      await execute(['commit', '-m', 'test message']);
      const result = await repo.history(testRepo);
      expect(result.latest.message).toEqual('test message');
    });

    it('should allow multiple commit messages', async () => {
      await repo.file(testRepo, { path: 'example.md', content: content.example1 });
      await repo.add(testRepo, ['example.md']);
      await execute(['commit', '-m', 'test message 1', '-m', 'test message 2']);
      const result = await repo.history(testRepo);
      expect(result.latest.message).toEqual('test message 1 test message 2');
    });
  });

  describe('amend', () => {
    beforeEach(async () => {
      await repo.file(testRepo, { path: 'example.md', content: content.example1 });
      await repo.commit(testRepo, 'existing commit message');
    });

    it('should ask for unstaged changes', async () => {
      await repo.file(testRepo, { path: 'example2.md', content: content.example2 });
      const result = await execute(['commit', '-a']);
      expect(result).toContain('example2.md');
    });

    it('should use the last commit message as a placeholder', async () => {
      const result = await execute(['commit', '-a'], [cmd.TAB]);
      expect(result).toContain('existing commit message');
    });

    it('should change a existing commit message', async () => {
      await execute(['commit', '-a', '-m', 'new commit message']);
      const result = await repo.history(testRepo);
      expect(result.latest.message).toEqual('new commit message');
    });
  });
});
