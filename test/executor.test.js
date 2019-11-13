const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const Executor = require('../executor');

const { expect } = chai;
chai.use(chaiAsPromised);

describe('executor', () => {
  const examplePayload = {
    metadata: {
      vulnerabilities: {
        info: 0,
        low: 0,
        moderate: 0,
        high: 0,
        critical: 0
      },
      dependencies: 0,
      devDependencies: 587,
      optionalDependencies: 0,
      totalDependencies: 587
    }
  };

  describe('runNpmAuditCommand', () => {
    it('check the correct command is passed into exec', async () => {
      const logger = {
        info: () => {},
        error: () => {}
      };
      const jsonParser = {
        parse: () => {
          return {};
        }
      };
      let commandParams;
      const exec = (command, cb) => {
        commandParams = command;
        cb();
      };

      const executor = Executor({ exec, logger, jsonParser });

      await executor.runNpmAuditCommand({ retry: 1 });
      expect(commandParams).to.equal('npm audit --json');
    });

    it('check the parsed npm audit json is returned', async () => {
      const logger = {
        info: () => {},
        error: () => {}
      };
      const jsonParser = {
        parse: () => {
          return examplePayload;
        }
      };
      const exec = (_command, cb) => {
        cb();
      };

      const executor = Executor({ exec, logger, jsonParser });

      const response = await executor.runNpmAuditCommand({ retry: 1 });
      expect(response).to.equal(examplePayload);
    });

    it('check the stdout error is return after retries attempts fails', async () => {
      const stdoutErrorResponse = {
        error: {
          message: 'NOT FOUND'
        }
      };

      const logger = {
        info: () => {},
        error: () => {}
      };
      const jsonParser = {
        parse: () => {
          return stdoutErrorResponse;
        }
      };
      const exec = (_command, cb) => {
        cb();
      };

      const executor = Executor({ exec, logger, jsonParser });

      return expect(
        executor.runNpmAuditCommand({ retry: 1 })
      ).to.eventually.be.rejectedWith(stdoutErrorResponse);
    });

    it('check the error is return after retries attempts fails', async () => {
      const error = new Error('Something failed');

      const logger = {
        info: () => {},
        error: () => {}
      };
      const jsonParser = {
        parse: () => {
          return {};
        }
      };
      const exec = (_command, cb) => {
        cb(error, '');
      };

      const executor = Executor({ exec, logger, jsonParser });

      expect(
        executor.runNpmAuditCommand({ retry: 1 })
      ).to.eventually.be.rejectedWith(error);
    });

    it('check if it fails, it retries again', async () => {
      const stdoutErrorResponse = {
        error: {
          message: 'NOT FOUND'
        }
      };

      const logger = {
        info: () => {},
        error: () => {}
      };

      let counter = 0;
      const jsonParser = {
        parse: () => {
          if (counter === 0) {
            counter += 1;
            return stdoutErrorResponse;
          }
          return examplePayload;
        }
      };
      const exec = (_command, cb) => {
        cb();
      };

      const executor = Executor({ exec, logger, jsonParser });

      const response = await executor.runNpmAuditCommand({ retry: 1 });
      expect(response).to.equal(examplePayload);
    });
  });
});
