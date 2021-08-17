/* eslint-disable fp/no-nil */
/* eslint-disable fp/no-unused-expression */
import { evaluateFailedVulnerabilities, Level } from '../src/auditor';

describe('auditor', () => {
  describe(evaluateFailedVulnerabilities.name, () => {
    const config = {
      shouldWarn: false,
      retry: 3,
      info: 0,
      low: 0,
      moderate: 0,
      high: 0,
      critical: 0,
    };

    const npmResponse = {
      metaData: {
        vulnerabilities: {
          info: 0,
          low: 10,
          moderate: 0,
          high: 0,
          critical: 0,
        },
      },
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
          metaData: {
            vulnerabilities: {
              ...npmResponse.metaData.vulnerabilities,
              critical: 2,
            },
          },
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
