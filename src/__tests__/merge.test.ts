import * as cmd from '../../testing/cmd';
import * as repo from '../../testing/repo';
import * as content from '../../testing/content';

describe('merge', () => {
  let testRepo;
  let vc;

  beforeEach(async () => {
    testRepo = await repo.init();
    vc = cmd.create();

    await repo.branch(testRepo, 'test-branch-1');
    await repo.branch(testRepo, 'test-branch-2');
    await repo.branch(testRepo, 'test-branch-3');
  });

  afterEach(() => {
    testRepo.dir.cleanup();
  });

  it('should ask the user for a branch', async () => {
    await repo.branch(testRepo, 'my-branch');
    const result = await vc.execute(
      ['merge'], // args
      [], // inputs
      { env: { VC_GIT_DIR: testRepo.dir.path } }, // options
    )

    expect(result).toContain('main');
    expect(result).toContain('test-branch-1');
    expect(result).toContain('test-branch-2');
    expect(result).toContain('test-branch-3');
    expect(result).not.toContain('my-branch');
  });

  it('should merge a selected branch', async () => {
    await repo.branch(testRepo, 'my-branch');
    await repo.branch(testRepo, 'target-branch');
    await repo.file(testRepo, { path: 'example.md', content: content.example1 });
    await repo.commit(testRepo, 'test commit');
    await repo.branch(testRepo, 'my-branch');

    await vc.execute(
      ['merge'], // args
      ['target-branch', cmd.ENTER], // inputs
      { env: { VC_GIT_DIR: testRepo.dir.path } }, // options
    )

    const result = await testRepo.git.log();
    expect(result.latest.message).toEqual('test commit');
  });

  it('should stash existing changes and reapply it', async () => {
    await repo.branch(testRepo, 'my-branch');
    await repo.branch(testRepo, 'target-branch');
    await repo.file(testRepo, { path: 'example.md', content: content.example1 });
    await repo.commit(testRepo, 'test commit');
    await repo.branch(testRepo, 'my-branch');
    await repo.file(testRepo, { path: 'example2.md', content: content.example2 });
    await repo.commit(testRepo, 'another commit');
    await repo.file(testRepo, { path: 'example2.md', content: content.example3 });

    await vc.execute(
      ['merge', 'target-branch'], // args
      ['Y'], // inputs
      { env: { VC_GIT_DIR: testRepo.dir.path } }, // options
    );

    const status = await testRepo.git.status();

    expect(status.modified).toEqual(['example2.md']);
  });

  it('should abort the merge if a merge conflict exists', async () => {
    await repo.branch(testRepo, 'my-branch');
    await repo.branch(testRepo, 'target-branch');
    await repo.file(testRepo, { path: 'example.md', content: content.example1 });
    await repo.commit(testRepo, 'test commit');

    await repo.branch(testRepo, 'my-branch');
    await repo.file(testRepo, { path: 'example.md', content: content.example2 });
    await repo.commit(testRepo, 'test commit 2');
    await testRepo.git.merge(['target-branch']).catch(() => {});

    const result = await vc.execute(
        ['merge', 'target-branch'], // args
        [], // inputs
        { env: { VC_GIT_DIR: testRepo.dir.path } }, // options
      );

    expect(result).toContain('Merge in progress');
  });

  it('should abort the merge if no valid branch is selected', async () => {
    const result = await vc.execute(
      ['merge', 'target-branch'], // args
      [], // inputs
      { env: { VC_GIT_DIR: testRepo.dir.path } }, // options
    );

    expect(result).toContain('No valid branch selected');
  });
});
