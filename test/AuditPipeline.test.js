const { expect } = require('chai');
const AuditPipeline = require('../AuditPipeline');

describe('AuditPipeline', () => {
  describe('checkVulnerabilities', () => {
    it('if the vulnerabilities for low is greater than config, then a vulnerable result is returned', () => {
      const auditPipeline = AuditPipeline();
      const result = auditPipeline.checkVulnerabilities(
        {
          low: 4
        },
        { low: 6 }
      );
      expect(result).to.eql([
        {
          level: 'low',
          expectCount: 4,
          actualCount: 6
        }
      ]);
    });

    it('if the vulnerabilities for low is less than config, then no vulnerable result is returned', () => {
      const auditPipeline = AuditPipeline();
      const result = auditPipeline.checkVulnerabilities(
        {
          low: 4
        },
        { low: 3 }
      );
      expect(result).to.eql([]);
    });
  });
});
