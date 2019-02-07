const { expect } = require('chai');
const ArgsParser = require('../ArgsParser');

describe('ArgsParser', () => {
  describe('parseCommandLineArgs', () => {
    it('if no arguments are present a default config is returned', () => {
      const argsParser = ArgsParser();
      const result = argsParser.parseCommandLineArgs([]);
      expect(result).to.eql({
        low: 0,
        moderate: 0,
        high: 0,
        critical: 0
      });
    });

    it('if arg is an invalid format, error is thrown', () => {
      const argsParser = ArgsParser();
      expect(() => argsParser.parseCommandLineArgs(['-low=3'])).to.throw(
        Error,
        'one of the arguments is invalid'
      );
    });

    it('if arg is present, then it overrides default config value', () => {
      const argsParser = ArgsParser();
      const result = argsParser.parseCommandLineArgs(['--low=3']);
      expect(result).to.eql({
        low: 3,
        moderate: 0,
        high: 0,
        critical: 0
      });
    });

    it('if arg is unknown type, then it is ignored', () => {
      const argsParser = ArgsParser();
      const result = argsParser.parseCommandLineArgs(['--random=3']);
      expect(result).to.eql({
        low: 0,
        moderate: 0,
        high: 0,
        critical: 0
      });
    });
  });
});
