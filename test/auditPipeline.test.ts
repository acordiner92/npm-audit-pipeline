/* eslint-disable fp/no-nil */
/* eslint-disable fp/no-unused-expression */
import * as TE from 'fp-ts/TaskEither';
import { AuditPipelineEnv, runAudit } from '../src/auditPipeline';

describe('auditPipeline', () => {
  describe(runAudit.name, () => {
    it('bad command line args results in process exit 1', async () => {
      const auditPipelineEnv: AuditPipelineEnv = {
        getCommandLineArgs: () => ['random'],
        runNpmAuditCommand: jest.fn(),
      };

      const exitStatus = await runAudit()(auditPipelineEnv)();
      expect(exitStatus).toBe(1);
    });

    it('if npm audit child process fails then process exits with 1', async () => {
      const auditPipelineEnv: AuditPipelineEnv = {
        getCommandLineArgs: () => ['--low=3'],
        runNpmAuditCommand: _config => TE.left(new Error('an error occurred')),
      };

      const exitStatus = await runAudit()(auditPipelineEnv)();
      expect(exitStatus).toBe(1);
    });

    it('if there are vulnerabilities then process exits with 1', async () => {
      const auditPipelineEnv: AuditPipelineEnv = {
        getCommandLineArgs: () => ['--low=3'],
        runNpmAuditCommand: _config =>
          TE.right({
            info: 0,
            low: 4,
            moderate: 0,
            high: 0,
            critical: 0,
          }),
      };

      const exitStatus = await runAudit()(auditPipelineEnv)();
      expect(exitStatus).toBe(1);
    });

    it('if there are no vulnerabilities then process exits with 0', async () => {
      const auditPipelineEnv: AuditPipelineEnv = {
        getCommandLineArgs: () => ['--low=3'],
        runNpmAuditCommand: _config =>
          TE.right({
            info: 0,
            low: 2,
            moderate: 0,
            high: 0,
            critical: 0,
          }),
      };

      const exitStatus = await runAudit()(auditPipelineEnv)();
      expect(exitStatus).toBe(0);
    });
  });
});
