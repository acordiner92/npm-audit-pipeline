/**
 *
 * Handles the logic involving whether the pipeline
 * is in a successful state or not
 *
 */
const AuditPipeline = () => {
  /**
   * Determines if any of the vulnerability criteria
   * fails or not and returns all the failed results
   *
   * @param {object} argsConfig
   * @param {object} vulnerabilities
   * @returns {Array} failed vulnerability results
   */
  const checkVulnerabilities = (argsConfig, vulnerabilities) => {
    const results = Object.entries(argsConfig)
      .filter(([level, size]) => vulnerabilities[level] > size)
      .map(([level, expectCount]) => {
        const actualCount = vulnerabilities[level];
        return {
          level,
          expectCount,
          actualCount
        };
      });
    return results;
  };

  return {
    checkVulnerabilities
  };
};
module.exports = AuditPipeline;
