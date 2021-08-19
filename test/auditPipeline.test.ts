/* eslint-disable fp/no-nil */
/* eslint-disable fp/no-unused-expression */
import * as TE from 'fp-ts/TaskEither';
import { AuditPipelineEnv, runAudit } from '../src/auditPipeline';

describe('auditPipeline', () => {
  describe(runAudit.name, () => {
    it('bad command line args results in process exit 1', async () => {
      const exitProcessMock = jest.fn<never, [number]>();
      const auditPipelineEnv: AuditPipelineEnv = {
        getCommandLineArgs: () => ['random'],
        runNpmAuditCommand: jest.fn(),
        exitProcess: exitProcessMock,
      };
      await runAudit()(auditPipelineEnv)();

      expect(exitProcessMock.mock.calls[0][0]).toBe(1);
    });

    it('if npm audit child process fails then process exits with 1', async () => {
      const exitProcessMock = jest.fn<never, [number]>();
      const auditPipelineEnv: AuditPipelineEnv = {
        getCommandLineArgs: () => ['--low=3'],
        runNpmAuditCommand: _config => TE.left(new Error('an error occurred')),
        exitProcess: exitProcessMock,
      };
      await runAudit()(auditPipelineEnv)();

      expect(exitProcessMock.mock.calls[0][0]).toBe(1);
    });

    it('if there are vulnerabilities then process exits with 1', async () => {
      const exitProcessMock = jest.fn<never, [number]>();
      const auditPipelineEnv: AuditPipelineEnv = {
        getCommandLineArgs: () => ['--low=3'],
        runNpmAuditCommand: _config =>
          TE.right({
            metadata: {
              vulnerabilities: {
                info: 0,
                low: 4,
                moderate: 0,
                high: 0,
                critical: 0,
              },
            },
          }),
        exitProcess: exitProcessMock,
      };
      await runAudit()(auditPipelineEnv)();

      expect(exitProcessMock.mock.calls[0][0]).toBe(1);
    });

    it('if there are no vulnerabilities then process exits with 0', async () => {
      const exitProcessMock = jest.fn<never, [number]>();
      const auditPipelineEnv: AuditPipelineEnv = {
        getCommandLineArgs: () => ['--low=3'],
        runNpmAuditCommand: _config =>
          TE.right({
            metadata: {
              vulnerabilities: {
                info: 0,
                low: 2,
                moderate: 0,
                high: 0,
                critical: 0,
              },
            },
          }),
        exitProcess: exitProcessMock,
      };
      await runAudit()(auditPipelineEnv)();

      expect(exitProcessMock.mock.calls[0][0]).toBe(0);
    });
  });
});
