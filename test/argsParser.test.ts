/* eslint-disable fp/no-nil */
/* eslint-disable fp/no-unused-expression */
import { parseCommandLineArgs } from '../src/argsParser';
import * as E from 'fp-ts/Either';

describe('argsParser', () => {
  describe(parseCommandLineArgs.name, () => {
    test('if no arguments are present a default config is returned', () =>
      expect(parseCommandLineArgs([])).toStrictEqual(
        E.right({
          shouldWarn: false,
          low: 0,
          info: 0,
          moderate: 0,
          high: 0,
          critical: 0,
          retry: 3,
          packageManager: 'npm',
        }),
      ));

    test.each([
      [['-low=3']],
      [['random']],
      [['---low=3']],
      [['--low=3', '-high=4']],
      [['--']],
      [['--3']],
    ])('if arg is an invalid format such as %s, error is returned', flagValue =>
      expect(parseCommandLineArgs(flagValue)).toStrictEqual(
        E.left(new Error('one of the arguments is invalid')),
      ),
    );

    test('if arg is present, then it overrides default config value', () =>
      expect(parseCommandLineArgs(['--low=3'])).toStrictEqual(
        E.right({
          shouldWarn: false,
          low: 3,
          info: 0,
          moderate: 0,
          high: 0,
          critical: 0,
          retry: 3,
          packageManager: 'npm',
        }),
      ));

    test('if arg is has --warn, then shouldWarn should be true', () =>
      expect(parseCommandLineArgs(['--warn'])).toStrictEqual(
        E.right({
          shouldWarn: true,
          low: 0,
          info: 0,
          moderate: 0,
          high: 0,
          critical: 0,
          retry: 3,
          packageManager: 'npm',
        }),
      ));

    test('if arg is has --retry=5, then retry should be 5', () =>
      expect(parseCommandLineArgs(['--retry=5'])).toStrictEqual(
        E.right({
          shouldWarn: false,
          low: 0,
          info: 0,
          moderate: 0,
          high: 0,
          critical: 0,
          retry: 5,
          packageManager: 'npm',
        }),
      ));

    test.each([
      ['--package-manager=npm', 'npm'],
      ['--package-manager=yarn', 'yarn'],
      ['--package-manager=pnpm', 'pnpm'],
    ])(
      'if arg is has %s, then packageManager should be %s',
      (command, expectedPackageManager) =>
        expect(parseCommandLineArgs([command])).toStrictEqual(
          E.right({
            shouldWarn: false,
            low: 0,
            info: 0,
            moderate: 0,
            high: 0,
            critical: 0,
            retry: 3,
            packageManager: expectedPackageManager,
          }),
        ),
    );
  });
});
