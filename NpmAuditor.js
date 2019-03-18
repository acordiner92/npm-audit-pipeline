/**
 *
 * Handles the overall pipeline auditing process
 *
 */
const NpmAuditor = ({
  npmAuditParser,
  auditPipeline,
  argsParser,
  logger,
  process
}) => {
  /**
   * Runs the pipeline audit process
   *
   * @param {string} stdout stdout coming from command line
   * @returns process exits
   */
  const runAudit = stdout => {
    const argsConfig = argsParser.parseCommandLineArgs(process.argv.splice(2));
    const vulnerabilities = npmAuditParser.getVulnerabilities(stdout);
    const failedResults = auditPipeline.checkVulnerabilities(
      argsConfig,
      vulnerabilities
    );

    failedResults.forEach(x => {
      const { level, expectCount, actualCount } = x;

      logger.error('\x1b[31m', '\x1b[40m', 'NPM AUDIT FAILED');
      logger.error(
        '\x1b[0m',
        '\x1b[33m',
        `For level: ${level}, the expected vulnerabilities should be ${expectCount} but got ${actualCount}\n`
      );
    });

    if (failedResults.length && !argsConfig.shouldWarn) {
      return process.exit(1);
    }

    logger.info('NPM audit passed...');
    return process.exit(0);
  };
  return {
    runAudit
  };
};
module.exports = NpmAuditor;
