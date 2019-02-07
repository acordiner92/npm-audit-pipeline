const NpmAuditor = ({ npmAuditParser, auditPipeline, argsParser, logger, process }) => {
  const runAudit = (error, stdout) => {
    if (error) {
      logger.error(`failed to run child process error: ${error}`);
      return process.exit(1);
    }

    const vulnerabilites = npmAuditParser.getVulnerabilities(stdout);
    const results = auditPipeline.determineVulnerabilites({ high: 5 }, vulnerabilites);

    if (results.length) {
      results.map(x => {
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
