const AuditPipeline = () => {
  const checkVulnerabilites = (argsConfig, vulnerabilites) => {
    const results = Object.entries(argsConfig)
      .filter(([level, size]) => vulnerabilites[level] > size)
      .map(([level, expectCount]) => {
        const actualCount = vulnerabilites[level];
        return {
          level,
          expectCount,
          actualCount
        };
      });
    return results;
  };

  return {
    checkVulnerabilites
  };
};
module.exports = AuditPipeline;
