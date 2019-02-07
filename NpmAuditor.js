const NpmAuditor = ({
  npmAuditParser,
  auditPipeline,
  argsParser,
  logger,
  process
}) => {
  const runAudit = stdout => {
    const argsConfig = argsParser.parseCommandLineArgs(process.argv.splice(2));
    const vulnerabilites = npmAuditParser.getVulnerabilities(stdout);
    const failedResults = auditPipeline.checkVulnerabilites(
      argsConfig,
      vulnerabilites
    );

    if (failedResults.length) {
      failedResults.forEach(x => {
        const { level, expectCount, actualCount } = x;
        logger.error(
          `NPM audit failed. Expect for level ${level}, vulnerabilites expected ${expectCount} but got ${actualCount}`
        );
      });
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
