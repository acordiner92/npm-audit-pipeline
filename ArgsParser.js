/**
 *
 * Handles the parsing of arguments from command line
 *
 */
const ArgsParser = () => {
  const vulnerabilityFlagRegex = /^--(low|moderate|high|critical)=[0-9]+$/;

  const defaultConfig = {
    shouldWarn: false,
    low: 0,
    moderate: 0,
    high: 0,
    critical: 0
  };

  const isArgsValid = flagArg => {
    const pattern = new RegExp(/--\w+/);
    return pattern.test(flagArg);
  };

  const parseFlag = flagArg => {
    const pattern = new RegExp(vulnerabilityFlagRegex);
    const [flag] = pattern.exec(flagArg);
    const val = flag.substring(2);
    const [name, count] = val.split('=');
    return {
      name,
      count: parseInt(count, 10)
    };
  };

  /**
   * Builds an pipeline configuration from list of command
   * line arguments
   *
   * @param {Array} args arguments from command line
   * @returns {object} a pipeline configuration
   */
  const parseCommandLineArgs = args => {
    const areFlagsValid = args.every(x => isArgsValid(x));
    if (!areFlagsValid) {
      throw new Error('one of the arguments is invalid');
    }
    const config = args
      .filter(x => x.match(vulnerabilityFlagRegex))
      .reduce((prev, curr) => {
        const flag = parseFlag(curr);
        const conf = {
          ...prev
        };

        if (conf[flag.name] || conf[flag.name] === 0) {
          conf[flag.name] = flag.count;
        }

        return conf;
      }, defaultConfig);
    return { ...config, shouldWarn: args.some(x => x === '--warn') };
  };

  return {
    parseCommandLineArgs
  };
};
module.exports = ArgsParser;
