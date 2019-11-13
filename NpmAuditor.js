/**
 *
 * Handles the overall pipeline auditing process
 *
 */
const NpmAuditor = ({
  auditPipeline,
  argsParser,
  logger,
  process,
  executor
}) => {
  const getVulnerabilities = stdout => {
    const {
      metadata: { vulnerabilities }
    } = stdout;
    return vulnerabilities;
  };

  /**
   * Runs the pipeline audit process
   *
   * @returns process exits
   */
  const runAudit = async () => {
    const argsConfig = argsParser.parseCommandLineArgs(process.argv.splice(2));

    try {
      const stdout = await executor.runNpmAuditCommand(argsConfig);
      const failedResults = auditPipeline.checkVulnerabilities(
        argsConfig,
        getVulnerabilities(stdout)
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
    } catch (error) {
      logger.error(error);
      return process.exit(1);
    }
  };

  return {
    runAudit
  };
};
module.exports = NpmAuditor;
