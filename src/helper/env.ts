import path from 'path';

export const workingDir = path.resolve(process.env.VC_GIT_DIR ? process.env.VC_GIT_DIR : process.cwd());
