import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import { match } from 'fp-ts/boolean';
import * as A from 'fp-ts/Array';
import { sequenceS } from 'fp-ts/Apply';

export type NpmAuditorConfiguration = {
  shouldWarn: boolean;
  retry: number;
  low: number;
  moderate: number;
  high: number;
  critical: number;
};

type VulnerabilityFlag = {
  key: string;
  count: number;
};

const vulnerabilityFlagRegex = /^--(low|moderate|high|critical|retry)=[0-9]+$/;

const defaultConfig: NpmAuditorConfiguration = {
  shouldWarn: false,
  retry: 3,
  low: 0,
  moderate: 0,
  high: 0,
  critical: 0,
};

const isArgsValid = (flagArg: string) =>
  new RegExp(/(^|\s)--[^\d\W]+/).test(flagArg);

const isVulnerabilityFlag = (flagArg: string) =>
  new RegExp(vulnerabilityFlagRegex).test(flagArg);

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
        pipe(args, parseVulnerabilityFlagArgs, E.map(parseOtherFlagArgs(args))),
    ),
  );
