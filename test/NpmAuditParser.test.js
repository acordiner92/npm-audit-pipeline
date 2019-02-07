const { expect } = require('chai');
const NpmAuditParser = require('../NpmAuditParser');

describe('NpmAuditParser', () => {
  describe('getVulnerabilities', () => {
    it('if auditResult is not a json string an error is thrown', () => {
      const npmAuditParser = NpmAuditParser({});
      expect(() => npmAuditParser.getVulnerabilities({})).to.throw(
        Error,
        'Json result provided is not a valid json string'
      );
    });

    it('check that the vulnerabilities is returned', () => {
      const jsonParser = {
        parse: () => {
          return {
            metadata: {
              vulnerabilities: {
                low: 0
              }
            }
          };
        }
      };
      const npmAuditParser = NpmAuditParser({ jsonParser });
      const vulnerabilities = npmAuditParser.getVulnerabilities(
        'someJsonString'
      );
      expect(vulnerabilities).to.eql({
        low: 0
      });
    });
  });
});
