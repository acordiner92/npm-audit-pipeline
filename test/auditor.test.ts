/* eslint-disable fp/no-nil */
/* eslint-disable fp/no-unused-expression */
import { NpmAuditorConfiguration } from '../src/argsParser';
import { evaluateFailedVulnerabilities, Level } from '../src/auditor';

describe('auditor', () => {
  describe(evaluateFailedVulnerabilities.name, () => {
    const config: NpmAuditorConfiguration = {
      shouldWarn: false,
      retry: 3,
      info: 0,
      low: 0,
      moderate: 0,
      high: 0,
      critical: 0,
      packageManager: 'npm',
    };

    const npmResponse = {
      info: 0,
      low: 10,
      moderate: 0,
      high: 0,
      critical: 0,
    };

    test.each([
      [
        config,
        npmResponse,
        [
          {
            level: Level.low,
            expectedCount: 0,
            actualCount: 10,
          },
        ],
      ],
      [
        { ...config, critical: 1 },
        {
          ...npmResponse,
          critical: 2,
        },
        [
          {
            level: Level.low,
            expectedCount: 0,
            actualCount: 10,
          },
          {
            level: Level.critical,
            expectedCount: 1,
            actualCount: 2,
          },
        ],
      ],
      [{ ...config, low: 10 }, npmResponse, []],
    ])(
      'only vulnerabilities with higher that expect config amount are returned',
      (conf, resp, expected) =>
        expect(evaluateFailedVulnerabilities(conf)(resp)).toStrictEqual(
          expected,
        ),
    );
  });
});
