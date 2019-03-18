const { expect } = require('chai');
const NpmAuditor = require('../NpmAuditor');

describe('NpmAuditor', () => {
  describe('runAudit', () => {
    it('check only the flag args are being passed into argsParser', () => {
      let argsParam;
      const argsParser = {
        parseCommandLineArgs: args => {
          argsParam = args;
          return {};
        }
      };
      const npmAuditParser = {
        getVulnerabilities: () => {}
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
      const npmAuditor = NpmAuditor({
        npmAuditParser,
        argsParser,
        auditPipeline,
        logger,
        process
      });

      npmAuditor.runAudit('someunparsedJson');
      expect(argsParam).to.eql(['--low=3']);
    });

    it('if there a failed vulnerabilities (aka failed check) then process is exited with 1', () => {
      const argsParser = {
        parseCommandLineArgs: () => ({})
      };
      const npmAuditParser = {
        getVulnerabilities: () => {}
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
      const npmAuditor = NpmAuditor({
        npmAuditParser,
        argsParser,
        auditPipeline,
        logger,
        process
      });

      npmAuditor.runAudit('someunparsedJson');
      expect(exitCodeParam).to.eql(1);
    });

    it('if there a failed vulnerabilities but warn flag is enabled then it should exit with 0', () => {
      const argsParser = {
        parseCommandLineArgs: () => ({
          shouldWarn: true
        })
      };
      const npmAuditParser = {
        getVulnerabilities: () => {}
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
      const npmAuditor = NpmAuditor({
        npmAuditParser,
        argsParser,
        auditPipeline,
        logger,
        process
      });

      npmAuditor.runAudit('someunparsedJson');
      expect(exitCodeParam).to.eql(0);
    });

    it('if there a no failed vulnerabilities then process is exited with 0', () => {
      const argsParser = {
        parseCommandLineArgs: () => ({})
      };
      const npmAuditParser = {
        getVulnerabilities: () => {}
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
      const npmAuditor = NpmAuditor({
        npmAuditParser,
        argsParser,
        auditPipeline,
        logger,
        process
      });

      npmAuditor.runAudit('someunparsedJson');
      expect(exitCodeParam).to.eql(0);
    });
  });
});
