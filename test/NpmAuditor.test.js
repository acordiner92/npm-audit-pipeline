const { expect } = require('chai');
const NpmAuditor = require('../NpmAuditor');

describe('NpmAuditor', () => {
  describe('runAudit', () => {
    it('check only the flag args are being passed into argsParser', () => {
      let argsParam;
      const argsParser = {
        parseCommandLineArgs: args => {
          argsParam = args;
        }
      };
      const npmAuditParser = {
        getVulnerabilities: () => {}
      };
      const auditPipeline = {
        checkVulnerabilites: () => []
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
        parseCommandLineArgs: () => {}
      };
      const npmAuditParser = {
        getVulnerabilities: () => {}
      };
      const auditPipeline = {
        checkVulnerabilites: () => [
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
      expect(exitCodeParam).to.eql(1);
    });

    it('if there a no failed vulnerabilities then process is exited with 0', () => {
      const argsParser = {
        parseCommandLineArgs: () => {}
      };
      const npmAuditParser = {
        getVulnerabilities: () => {}
      };
      const auditPipeline = {
        checkVulnerabilites: () => []
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
