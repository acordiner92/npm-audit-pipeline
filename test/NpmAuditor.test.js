const { expect } = require('chai');
const NpmAuditor = require('../NpmAuditor');

describe('NpmAuditor', () => {
  const examplePayload = {
    metadata: {
      vulnerabilities: {
        info: 0,
        low: 0,
        moderate: 0,
        high: 0,
        critical: 0
      },
      dependencies: 0,
      devDependencies: 587,
      optionalDependencies: 0,
      totalDependencies: 587
    }
  };

  describe('runAudit', () => {
    it('check only the flag args are being passed into argsParser', async () => {
      let argsParam;
      const argsParser = {
        parseCommandLineArgs: args => {
          argsParam = args;
          return {};
        }
      };
      const auditPipeline = {
        checkVulnerabilities: () => []
      };
      const logger = {
        info: () => {},
        error: () => {}
      };
      const process = {
        argv: ['nodePath', 'filePath', '--low=3'],
        exit: () => {}
      };
      const executor = {
        runNpmAuditCommand: () => examplePayload
      };

      const npmAuditor = NpmAuditor({
        argsParser,
        auditPipeline,
        logger,
        process,
        executor
      });

      await npmAuditor.runAudit();
      expect(argsParam).to.eql(['--low=3']);
    });

    it('if there a failed vulnerabilities (aka failed check) then process is exited with 1', async () => {
      const argsParser = {
        parseCommandLineArgs: () => ({})
      };
      const auditPipeline = {
        checkVulnerabilities: () => [
          {
            level: 'low',
            expectCount: 0,
            actualCount: 1
          }
        ]
      };
      const logger = {
        info: () => {},
        error: () => {}
      };
      let exitCodeParam;
      const process = {
        argv: ['nodePath', 'filePath'],
        exit: exitCode => {
          exitCodeParam = exitCode;
        }
      };
      const executor = {
        runNpmAuditCommand: () => examplePayload
      };
      const npmAuditor = NpmAuditor({
        argsParser,
        auditPipeline,
        logger,
        process,
        executor
      });

      await npmAuditor.runAudit();
      expect(exitCodeParam).to.eql(1);
    });

    it('if there a failed vulnerabilities but warn flag is enabled then it should exit with 0', async () => {
      const argsParser = {
        parseCommandLineArgs: () => ({
          shouldWarn: true
        })
      };
      const auditPipeline = {
        checkVulnerabilities: () => [
          {
            level: 'low',
            expectCount: 0,
            actualCount: 1
          }
        ]
      };
      const logger = {
        info: () => {},
        error: () => {}
      };
      let exitCodeParam;
      const process = {
        argv: ['nodePath', 'filePath', '--warn'],
        exit: exitCode => {
          exitCodeParam = exitCode;
        }
      };
      const executor = {
        runNpmAuditCommand: () => examplePayload
      };
      const npmAuditor = NpmAuditor({
        argsParser,
        auditPipeline,
        logger,
        process,
        executor
      });

      await npmAuditor.runAudit('someunparsedJson');
      expect(exitCodeParam).to.eql(0);
    });

    it('if there a no failed vulnerabilities then process is exited with 0', async () => {
      const argsParser = {
        parseCommandLineArgs: () => ({})
      };
      const auditPipeline = {
        checkVulnerabilities: () => []
      };
      const logger = {
        info: () => {},
        error: () => {}
      };
      let exitCodeParam;
      const process = {
        argv: ['nodePath', 'filePath', '--low=3'],
        exit: exitCode => {
          exitCodeParam = exitCode;
        }
      };
      const executor = {
        runNpmAuditCommand: () => examplePayload
      };
      const npmAuditor = NpmAuditor({
        argsParser,
        auditPipeline,
        logger,
        process,
        executor
      });

      await npmAuditor.runAudit('someunparsedJson');
      expect(exitCodeParam).to.eql(0);
    });
  });
});
