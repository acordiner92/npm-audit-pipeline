/**
 * Handles the parsing of npm audit stdout
 *
 * @param {*} { jsonParser }
 * @returns
 */
const NpmAuditParser = ({ jsonParser }) => {
  /**
   * Gets all the vulnerabilities from
   * npm audit
   *
   * @param {string} stdout stdout from command line
   * @returns {Array} npm audit vulnerabilities
   */
  const getVulnerabilities = stdout => {
    if (typeof stdout !== 'string') {
      throw new Error('Json result provided is not a valid json string');
    }
    const result = jsonParser.parse(stdout);
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
