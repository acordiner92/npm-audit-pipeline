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

export type NpmAuditResponse = {
  info: number;
  low: number;
  moderate: number;
  high: number;
  critical: number;
};

export const handleExecResponse = ({
  stderr,
  stdout,
}: ChildProcessResponse): E.Either<Error, NpmAuditResponse> =>
  !stderr || stderr
    ? pipe(
        stdout,
        JSON.parse,
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
