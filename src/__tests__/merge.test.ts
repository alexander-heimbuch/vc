import * as cmd from '../../testing/cmd';
import * as repo from '../../testing/repo';
import * as content from '../../testing/content';

describe('merge', () => {
  let testRepo;
  let vcs;

  beforeEach(async () => {
    testRepo = await repo.init();
    vcs = cmd.create();

    await repo.branch(testRepo, 'test-branch-1');
    await repo.branch(testRepo, 'test-branch-2');
    await repo.branch(testRepo, 'test-branch-3');

  });

  afterEach(() => {
    testRepo.dir.cleanup();
  })

  it('should ask the user for a branch', async () => {
    const result = await vcs.execute( // executes the command!
      ['merge', 'test-branch-3'], // args
      [], // inputs
      { env: { GIT_DIR: testRepo.dir.path  }  }, // options
    );

    console.log(result)
  })
});
