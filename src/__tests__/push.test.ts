import * as cmd from '../../testing/cmd';
import * as repo from '../../testing/repo';
import * as content from '../../testing/content';

describe('push', () => {
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
    await repo.branch(testRemote, 'test-branch-1');
    await repo.branch(testRepo, 'test-branch-1');
    await repo.addRemote(testRepo, 'upstream', testRemote);
    await testRepo.git.fetch(['--all']);
  });

  afterEach(() => {
    testRepo.dir.cleanup();
  });

  describe('with existing remote branch', () => {
    it('should push changes to an existing branch', async () => {
      await testRepo.git.branch(['--set-upstream-to', 'upstream/test-branch-1']);

      await repo.file(testRepo, { path: 'example.md', content: content.example1 });
      await repo.commit(testRepo, 'example commit');

      const result = await execute(['push'])
      expect(result).toContain('Pushed test-branch-1 → upstream/test-branch-1')
    });
  });

  describe('without remote branch', () => {
    it('should ask for a remote branch', async () => {
      const result = await execute(['push', 'upstream']);
      expect(result).toContain('test-remote-branch');
    });

    it('should push to a selected remote branch', async () => {
      const result = await execute(['push', 'upstream'], ['test-branch-1', cmd.ENTER]);
      expect(result).toContain('Pushed test-branch-1 → upstream/test-branch-1')
    });

    it('should push to a new remote branch', async () => {
      const result = await execute(['push', 'upstream'], ['test-branch-1', cmd.ENTER]);
      expect(result).toContain('Pushed test-branch-1 → upstream/test-branch-1')
    })
  });

  describe('failed push', () => {
    it('should give an appropriate failed message', async () => {
      const result = await execute(['push', 'upstream'], ['test-branch-2', cmd.ENTER]);
      expect(result).toContain('Push failed')
    })
  })
});
