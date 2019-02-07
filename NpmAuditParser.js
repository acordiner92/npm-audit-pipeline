const NpmAuditParser = () => {
  const getVulnerabilities = auditResult => {
    if (typeof auditResult !== 'string') {
      throw new Error('Json result provided is not a valid json string');
    }
    const result = JSON.parse(auditResult);
    const {
      metadata: { vulnerabilities }
    } = result;
    return vulnerabilities;
  };

  return {
    getVulnerabilities
  };
};
module.exports = NpmAuditParser;
