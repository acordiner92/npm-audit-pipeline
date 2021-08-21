import { flow, pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import { match } from 'fp-ts/boolean';
import * as String from 'fp-ts/string';
import * as t from 'io-ts';
import * as A from 'fp-ts/Array';
import * as RA from 'fp-ts/ReadonlyArray';
import { sequenceS } from 'fp-ts/Apply';

export type NpmAuditorConfiguration = {
  shouldWarn: boolean;
  retry: number;
  info: number;
  low: number;
  moderate: number;
  high: number;
  critical: number;
  packageManager: 'npm' | 'yarn' | 'pnpm';
};

type VulnerabilityFlag = {
  key: string;
  count: number;
};

const packageManagerTypes = t.union([
  t.literal('npm'),
  t.literal('yarn'),
  t.literal('pnpm'),
]);

const vulnerabilityFlagRegex = /^--(low|moderate|high|critical|retry)=[0-9]+$/;
const packageManagerFlagRegex = /^--package-manager=(npm|yarn|pnpm)$/;

const defaultConfig: NpmAuditorConfiguration = {
  shouldWarn: false,
  retry: 3,
  info: 0,
  low: 0,
  moderate: 0,
  high: 0,
  critical: 0,
  packageManager: 'npm',
};

const isArgsValid = (flagArg: string) =>
  new RegExp(/(^|\s)--[^\d\W]+/).test(flagArg);

const isVulnerabilityFlag = (flagArg: string) =>
  new RegExp(vulnerabilityFlagRegex).test(flagArg);

const isPackageManagerFlagRegex = (flagArg: string) =>
  new RegExp(packageManagerFlagRegex).test(flagArg);

const parseVulnerabilityFlagArg = (
  flagArg: string,
): E.Either<Error, VulnerabilityFlag> =>
  pipe(
    O.fromNullable(new RegExp(vulnerabilityFlagRegex).exec(flagArg)),
    O.chain(A.head),
    O.map(x => x.split('=')),
    O.chain(x =>
      sequenceS(O.option)({
        key: pipe(
          A.lookup(0)(x),
          O.map(x => x.replace('--', '')),
        ),
        count: pipe(A.lookup(1)(x), O.map(parseInt)),
      }),
    ),
    E.fromOption(() => new Error('Failed to parse command line arguments')),
  );

const parseVulnerabilityFlagArgs = (args: ReadonlyArray<string>) =>
  pipe(
    args.filter(isVulnerabilityFlag),
    A.map(parseVulnerabilityFlagArg),
    E.sequenceArray,
    E.map(x =>
      x.reduce<NpmAuditorConfiguration>(
        (prev, curr) => ({
          ...prev,
          [curr.key]: curr.count,
        }),
        defaultConfig,
      ),
    ),
  );

const parsePackageManagerFlag =
  (args: ReadonlyArray<string>) =>
  (config: NpmAuditorConfiguration): E.Either<Error, NpmAuditorConfiguration> =>
    pipe(
      args.filter(isPackageManagerFlagRegex),
      A.head,
      O.fold(
        () => E.right(config),
        flow(
          String.split('='),
          RA.lookup(1),
          E.fromOption(
            () => new Error('Failed to parse command line arguments'),
          ),
          E.chain(
            flow(
              packageManagerTypes.decode,
              E.mapLeft(
                () => new Error('Failed to parse command line arguments'),
              ),
            ),
          ),
          E.map(x => ({
            ...config,
            packageManager: x,
          })),
        ),
      ),
    );

const parseOtherFlagArgs =
  (args: ReadonlyArray<string>) => (config: NpmAuditorConfiguration) => ({
    ...config,
    shouldWarn: args.some(x => x === '--warn'),
  });

export const parseCommandLineArgs = (
  args: ReadonlyArray<string>,
): E.Either<Error, NpmAuditorConfiguration> =>
  pipe(
    args.every(isArgsValid),
    match(
      () => E.left(new Error('one of the arguments is invalid')),
      () =>
        pipe(
          args,
          parseVulnerabilityFlagArgs,
          E.chain(parsePackageManagerFlag(args)),
          E.map(parseOtherFlagArgs(args)),
        ),
    ),
  );
