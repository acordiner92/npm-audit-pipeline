import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';
import { PathReporter } from 'io-ts/lib/PathReporter';
import { NpmResponseError } from './errors';

type ChildProcessResponse = {
  stdout: string;
  stderr: string;
};

const NpmAuditResponseRaw = t.exact(
  t.type({
    metadata: t.exact(
      t.type({
        vulnerabilities: t.exact(
          t.type({
            info: t.number,
            low: t.number,
            moderate: t.number,
            high: t.number,
            critical: t.number,
          }),
        ),
      }),
    ),
  }),
);

const YarnAuditResponseRaw = t.exact(
  t.type({
    data: t.exact(
      t.type({
        vulnerabilities: t.exact(
          t.type({
            info: t.number,
            low: t.number,
            moderate: t.number,
            high: t.number,
            critical: t.number,
          }),
        ),
      }),
    ),
  }),
);

export type NpmAuditResponse = {
  info: number;
  low: number;
  moderate: number;
  high: number;
  critical: number;
};

export const handleExecYarnResponse = ({
  stderr,
  stdout,
}: ChildProcessResponse): E.Either<Error, NpmAuditResponse> =>
  !stderr || (stderr && stdout)
    ? pipe(
        stdout,
        JSON.parse, // TODO: trycatch this
        YarnAuditResponseRaw.decode,
        E.mapLeft(e => new Error(PathReporter.report(E.left(e)).join('\n'))),
        E.map(x => ({
          info: x.data.vulnerabilities.info,
          low: x.data.vulnerabilities.low,
          moderate: x.data.vulnerabilities.moderate,
          high: x.data.vulnerabilities.high,
          critical: x.data.vulnerabilities.critical,
        })),
      )
    : E.left(new NpmResponseError('npm audit returned an error', stderr));

export const handleExecResponse = ({
  stderr,
  stdout,
}: ChildProcessResponse): E.Either<Error, NpmAuditResponse> =>
  !stderr
    ? pipe(
        stdout,
        JSON.parse, // TODO: trycatch this
        NpmAuditResponseRaw.decode,
        E.mapLeft(e => new Error(PathReporter.report(E.left(e)).join('\n'))),
        E.map(x => ({
          info: x.metadata.vulnerabilities.info,
          low: x.metadata.vulnerabilities.low,
          moderate: x.metadata.vulnerabilities.moderate,
          high: x.metadata.vulnerabilities.high,
          critical: x.metadata.vulnerabilities.critical,
        })),
      )
    : E.left(new NpmResponseError('npm audit returned an error', stderr));
