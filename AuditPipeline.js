/**
 *
 * Handles the logic involving whether the pipeline
 * is in a successful state or not
 *
 */
const AuditPipeline = () => {
  /**
   * Determines if any of the vulnernability criteria
   * fails or not and returns all the failed results
   *
   * @param {object} argsConfig
   * @param {object} vulnerabilites
   * @returns {Array} failed vulnernability results
   */
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
