import type { ExecException } from 'child_process';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import * as RTE from 'fp-ts/ReaderTaskEither';
import { pipe } from 'fp-ts/function';
import { error } from 'fp-ts/lib/Console';
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
export type ExecutorEnv = {
  exec: (
    command: string,
    callback: (
      error: ExecException | null,
      stdout: string,
      stderr: string,
    ) => void,
  ) => void;
};

const policy = (retries: number) =>
  capDelay(2000, Monoid.concat(exponentialBackoff(200), limitRetries(retries)));

const execAsPromise = (
  env: ExecutorEnv,
  command: string,
): Promise<ChildProcessResponse> =>
  new Promise((resolve, reject) =>
    env.exec(command, (err, stdout, stderr) =>
      err ? pipe(error(err)(), () => reject(err)) : resolve({ stdout, stderr }),
    ),
  );
export const runNpmAuditCommand = (
  config: NpmAuditorConfiguration,
): RTE.ReaderTaskEither<ExecutorEnv, Error, NpmAuditResponse> =>
  pipe(
    RTE.ask<ExecutorEnv>(),
    RTE.chainTaskEitherK(env =>
      retrying(
        policy(config.retry),
        () =>
          pipe(
            TE.tryCatch(
              () => execAsPromise(env, 'npm audit --json'),
              error =>
                error instanceof Error
                  ? error
                  : new Error('Failed to execute child process command'),
            ),
            TE.chainEitherK(handleExecResponse),
          ),
        E.isLeft,
      ),
    ),
  );
