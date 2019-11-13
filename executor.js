/**
 *
 * Handles the fetching of the npm audit data
 *
 */
const Executor = ({ exec, jsonParser, logger }) => {
  const exceededRetries = (parsedStdOut, retries, retry) =>
    parsedStdOut.error && retries >= retry;

  const callNpm = async (retry, retries) =>
    new Promise((resolve, reject) => {
      exec('npm audit --json', (error, stdOut) => {
        const parsedStdOut = jsonParser.parse(stdOut);
        if (error || parsedStdOut.error) {
          if (exceededRetries(parsedStdOut, retries, retry)) {
            logger.error(`Failed to fetch NPM audit after ${retry} retries`);
            return reject(parsedStdOut.error || error);
          }
          return resolve(callNpm(retry, retries + 1));
        }
        return resolve(parsedStdOut);
      });
    });

  /**
   * Runs the npm audit command and then parses
   * the json response
   *
   * @param {object} config
   * @returns {object} parsed json audit result
   */
  const runNpmAuditCommand = config => {
    const { retry } = config;
    return callNpm(retry, 0);
  };

  return {
    runNpmAuditCommand
  };
};
module.exports = Executor;
