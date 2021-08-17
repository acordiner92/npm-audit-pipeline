/* eslint-disable fp/no-nil */
/* eslint-disable fp/no-unused-expression */
import E from 'fp-ts/Either';
import { NpmResponseError } from '../src/errors';
import { handleExecResponse } from '../src/executorResponseHandler';

describe('executorResponseHandler', () => {
  describe(handleExecResponse.name, () => {
    test('if stderr value is set then an NpmResponseError is returned', () =>
      expect(
        handleExecResponse({
          stderr: 'npm audit error',
          stdout: '',
        }),
      ).toStrictEqual(
        E.left(
          new NpmResponseError(
            'npm audit returned an error',
            'npm audit error',
          ),
        ),
      ));

    test('if npm response is not in correct format, validation error is returned', () =>
      expect(
        handleExecResponse({
          stderr: '',
          stdout: JSON.stringify({
            otherValue: 'otherValue',
          }),
        }),
      ).toStrictEqual(
        E.left(
          new Error(
            'Invalid value undefined supplied to : { metaData: { vulnerabilities: { info: number, low: number, moderate: number, high: number, critical: number } } }/metaData: { vulnerabilities: { info: number, low: number, moderate: number, high: number, critical: number } }',
          ),
        ),
      ));

    test('a NpmAuditResponse is returned upon valid npm response', () =>
      expect(
        handleExecResponse({
          stderr: '',
          stdout: JSON.stringify({
            metaData: {
              vulnerabilities: {
                info: 0,
                low: 10,
                moderate: 2,
                high: 1,
                critical: 6,
              },
            },
          }),
        }),
      ).toStrictEqual(
        E.right({
          metaData: {
            vulnerabilities: {
              info: 0,
              low: 10,
              moderate: 2,
              high: 1,
              critical: 6,
            },
          },
        }),
      ));
  });
});
