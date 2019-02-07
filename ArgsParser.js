/**
 *
 * Handles the parsing of arguments from command line
 *
 */
const ArgsParser = () => {
  const defaultConfig = {
    low: 0,
    moderate: 0,
    high: 0,
    critical: 0
  };

  const isArgsValid = flagArg => {
    const pattern = new RegExp(/^--\w+=[0-9]+$/);
    return pattern.test(flagArg);
  };

  const parseFlag = flagArg => {
    const val = flagArg.substring(2);
    const [name, count] = val.split('=');
    return {
      name,
      count: parseInt(count, 10)
    };
  };

  /**
   * Builds an pipeline configuration from list of command
   * line arguements
   *
   * @param {Array} args arguments from command line
   * @returns {object} a pipeline configuration
   */
  const parseCommandLineArgs = args => {
    const areFlagsValid = args.every(x => isArgsValid(x));
    if (!areFlagsValid) {
      throw new Error('one of the arguments is invalid');
    }
    const config = args.reduce((prev, curr) => {
      const flag = parseFlag(curr);
      const conf = {
        ...prev
      };

      if (conf[flag.name] || conf[flag.name] === 0) {
        conf[flag.name] = flag.count;
      }

      return conf;
    }, defaultConfig);
    return config;
  };

  return {
    parseCommandLineArgs
  };
};
module.exports = ArgsParser;
