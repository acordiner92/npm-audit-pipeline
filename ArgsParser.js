const ArgsParser = () => {
  const parseFlag = flagArg => {
    const val = flagArg.subString(2);
    const [name, count] = val.split('=');
    return {
      name,
      count
    };
  };

  const parsePipelineArgs = args => {
    const config = args.reduce((prev, curr) => {
      const flag = parseFlag(curr);
      const conf = {
        ...prev
      };
      conf[flag.name] = flag.value;
      return conf;
    }, {});
    return config;
  };

  return {
    parsePipelineArgs
  };
};
module.exports = ArgsParser;
