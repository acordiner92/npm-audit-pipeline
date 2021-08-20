/* eslint-disable fp/no-nil */
/* eslint-disable fp/no-unused-expression */
import * as E from 'fp-ts/Either';
import { ExecutorEnv, runNpmAuditCommand } from '../src/executor';
import type { ExecException } from 'child_process';

describe('runNpmAuditCommand', () => {
  const config = {
    shouldWarn: false,
    retry: 3,
    info: 0,
    low: 0,
    moderate: 0,
    high: 0,
    critical: 0,
  };

  describe(runNpmAuditCommand.name, () => {
    it('A error is returned if child process fails to execute npm audit', async () => {
      const error: ExecException = new Error('an error occurred');

      const executorEnvMock: ExecutorEnv = {
        exec: (_command, cb) => {
          cb(error, '', '');
        },
      };
      const resp = await runNpmAuditCommand(config)(executorEnvMock)();
      expect(resp).toStrictEqual(E.left(new Error('an error occurred')));
    });

    it('A parse npm audit response is returned', async () => {
      const npmResponse = {
        metadata: {
          vulnerabilities: {
            info: 5,
            low: 10,
            moderate: 2,
            high: 0,
            critical: 1,
          },
          dependencies: 535,
          devDependencies: 0,
          optionalDependencies: 0,
          totalDependencies: 535,
        },
      };
      const executorEnvMock: ExecutorEnv = {
        exec: (_command, cb) => {
          cb(null, JSON.stringify(npmResponse), '');
        },
      };
      const resp = await runNpmAuditCommand(config)(executorEnvMock)();
      expect(resp).toStrictEqual(
        E.right({
          info: 5,
          low: 10,
          moderate: 2,
          high: 0,
          critical: 1,
        }),
      );
    });
  });
});
