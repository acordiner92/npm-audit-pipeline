import { exec } from 'child_process';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { NpmAuditorConfiguration } from './argsParser';
import {
  handleExecResponse,
  NpmAuditResponse,
} from './executorResponseHandler';
import { capDelay, exponentialBackoff, limitRetries, Monoid } from 'retry-ts';
import { retrying } from 'retry-ts/Task';

type ChildProcessResponse = {
  stdout: string;
  stderr: string;
};

const policy = (retries: number) =>
  capDelay(2000, Monoid.concat(exponentialBackoff(200), limitRetries(retries)));

const execAsPromise = (command: string): Promise<ChildProcessResponse> =>
  new Promise((resolve, reject) =>
    exec(command, (error, stdout, stderr) =>
      error ? reject(error) : resolve({ stdout, stderr }),
    ),
  );
export const runNpmAuditCommand = (
  config: NpmAuditorConfiguration,
): TE.TaskEither<Error, NpmAuditResponse> =>
  retrying(
    policy(config.retry),
    () =>
      pipe(
        TE.tryCatch(
          () => execAsPromise('npm audit --json'),
          error =>
            error instanceof Error
              ? error
              : new Error('Failed to execute child process command'),
        ),
        TE.chainEitherK(handleExecResponse),
      ),
    E.isLeft,
  );
