import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';
import { PathReporter } from 'io-ts/lib/PathReporter';
import { NpmResponseError } from './errors';

type ChildProcessResponse = {
  stdout: string;
  stderr: string;
};

const NpmAuditResponse = t.type({
  metaData: t.type({
    vulnerabilities: t.type({
      info: t.number,
      moderate: t.number,
      high: t.number,
      critical: t.number,
    }),
  }),
});
export type NpmAuditResponse = t.TypeOf<typeof NpmAuditResponse>;

export const handleExecResponse = ({
  stderr,
  stdout,
}: ChildProcessResponse): E.Either<Error, NpmAuditResponse> =>
  !stderr
    ? pipe(
        stdout,
        JSON.parse,
        NpmAuditResponse.decode,
        E.mapLeft(e => new Error(PathReporter.report(E.left(e)).join('\n'))),
      )
    : E.left(new NpmResponseError('npm audit returned an error', stderr));
