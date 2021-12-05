import * as cmd from '../../testing/cmd';
import * as repo from '../../testing/repo';
import * as content from '../../testing/content';

describe('branch', () => {
  let testRepo: repo.TestEnv;
  let testRemote: repo.TestEnv;
  let vc;
  let execute;

  beforeEach(async () => {
    testRepo = await repo.init();
    testRemote = await repo.init();
    vc = cmd.create();

    execute = async (args = [], inputs = []) =>
      vc.execute(
        args, // args
        inputs, // inputs
        { env: { VC_GIT_DIR: testRepo.dir.path } } // options
      );

    await repo.branch(testRemote, 'test-remote-branch');
    await repo.branch(testRepo, 'test-branch-1');
    await repo.addRemote(testRepo, 'upstream', testRemote);
  });

  afterEach(() => {
    testRepo.dir.cleanup();
  });

  describe('stashes', () => {
    it('should ask to stash changes', async () => {
      await repo.file(testRepo, { path: 'example.md', content: content.example1 });
      await repo.commit(testRepo, 'example commit');
      await repo.file(testRepo, { path: 'example.md', content: content.example2 });

      const result = await execute(['branch']);
      expect(result).toContain('Stash changes?');
    });

    it('should stash changes', async () => {
      await repo.file(testRepo, { path: 'example.md', content: content.example1 });
      await repo.commit(testRepo, 'example commit');
      await repo.file(testRepo, { path: 'example.md', content: content.example2 });

      const existing = await repo.status(testRepo);
      expect(existing.files.length).toBe(1);

      await execute(['branch'], [cmd.ENTER]);
      const result = await repo.status(testRepo);

      expect(result.files.length).toBe(0);
    });
  });

  describe('local branch selection', () => {
    beforeEach(async () => {
      await repo.branch(testRepo, 'test-local-branch-1');
      await repo.branch(testRepo, 'test-local-branch-2');
      await repo.branch(testRepo, 'test-local-branch-3');
      await repo.branch(testRepo, 'test-local-branch-4');
    });

    it('should list local branches', async () => {
      const result = await execute(['branch'], ['test-local']);

      expect(result).toContain('test-local-branch-1');
      expect(result).toContain('test-local-branch-2');
      expect(result).toContain('test-local-branch-3');
    });

    it('should switch to an existing local branch', async () => {
      await execute(['branch'], ['test-local-branch-1', cmd.ENTER]);
      const result = await testRepo.git.status();
      expect(result.current).toEqual('test-local-branch-1');
    });

    it('should accept a new branch name', async () => {
      const result = await execute(['branch'], ['a-new-branch', cmd.ENTER]);
      expect(result).toContain('a-new-branch');
    });

    it('should use a provided branch name', async () => {
      await execute(['branch', 'test-local-branch-1']);
      const result = await testRepo.git.status();
      expect(result.current).toEqual('test-local-branch-1');
    });
  });

  describe('remote branch selection', () => {
    beforeEach(async () => {
      await repo.branch(testRemote, 'test-remote-branch-1');
      await repo.branch(testRemote, 'test-remote-branch-2');
      await repo.branch(testRemote, 'test-remote-branch-3');
      await repo.branch(testRemote, 'test-remote-branch-4');
    });

    it('should query for a remote branch', async () => {
      const result = await execute(['branch', 'a-new-branch'], ['test-remote-branch']);

      expect(result).toContain('upstream/test-remote-branch-1');
      expect(result).toContain('upstream/test-remote-branch-2');
      expect(result).toContain('upstream/test-remote-branch-3');
      expect(result).toContain('upstream/test-remote-branch-4');
    });

    it('should accept an existing remote branch', async () => {
      await execute(['branch', 'a-new-branch'], ['upstream/test-remote-branch-1', cmd.ENTER]);

      const result = await testRepo.git.status();
      expect(result.current).toEqual('a-new-branch');
      expect(result.tracking).toEqual('upstream/test-remote-branch-1');
    });

    it('should accept a non existing remote branch', async () => {
      await execute(['branch', 'a-new-branch'], ['upstream/test-remote-branch-1', cmd.ENTER]);

      const result = await testRepo.git.status();
      expect(result.current).toEqual('a-new-branch');
      expect(result.tracking).toEqual('upstream/test-remote-branch-1');
    });

    it('should allow to skip the remote', async () => {
      await execute(['branch', 'a-new-branch'], [cmd.ENTER]);
      const result = await testRepo.git.status();
      expect(result.current).toEqual('a-new-branch');
      expect(result.tracking).toEqual(null);
    });

    it('should use a provided remote', async () => {
      await execute(['branch', 'a-new-branch', '-r', 'upstream/test-remote-branch-1']);

      const result = await testRepo.git.status();
      expect(result.current).toEqual('a-new-branch');
      expect(result.tracking).toEqual('upstream/test-remote-branch-1');
    });
  });
});
