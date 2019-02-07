const ArgsParser = () => {
  const defaultConfig = {
    low: 0,
    moderate: 0,
    high: 0,
    critical: 0
  };

  const parseFlag = flagArg => {
    const val = flagArg.subString(2);
    const [name, count] = val.split('=');
    return {
      name,
      count
    };
  };

  const parseCommandLineArgs = args => {
    const config = args.reduce((prev, curr) => {
      const flag = parseFlag(curr);
      const conf = {
        ...prev
      };
      conf[flag.name] = flag.value;
      return conf;
    }, defaultConfig);
    return config;
  };

  return {
    parseCommandLineArgs
  };
};
module.exports = ArgsParser;
