import { constant, constVoid, flow, pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';
import * as T from 'fp-ts/Task';
import * as RT from 'fp-ts/ReaderTask';
import * as IO from 'fp-ts/IO';
import { info, error } from 'fp-ts/Console';
import { NpmAuditorConfiguration, parseCommandLineArgs } from './argsParser';
import { evaluateFailedVulnerabilities, LevelAudit } from './auditor';
import { NpmAuditResponse } from './executorResponseHandler';

export type AuditPipelineEnv = {
  getCommandLineArgs: () => ReadonlyArray<string>;
  runNpmAuditCommand: (
    config: NpmAuditorConfiguration,
  ) => TE.TaskEither<Error, NpmAuditResponse>;
};

export enum ExitStatus {
  success = 0,
  failed = 1,
}

const writeVulnerabilityResultToTerminal = (
  failedVulnerabilities: ReadonlyArray<LevelAudit>,
) =>
  failedVulnerabilities.map(x => {
    const { level, expectedCount, actualCount } = x;
    return pipe(
      error('\x1b[31m \x1b[40m NPM AUDIT FAILED'),
      IO.chain(() =>
        error(
          `\x1b[0m \x1b[33m For level: ${level}, the expected vulnerabilities should be ${expectedCount} but got ${actualCount}\n`,
        ),
      ),
    )();
  });

const logResultToTerminal = (
  result: TE.TaskEither<Error, readonly LevelAudit[]>,
): T.Task<ExitStatus> =>
  pipe(
    result,
    TE.fold(
      error =>
        pipe(
          info(
            `\x1b[31m \x1b[40m Failed to run npm audit pipeline - Reason: ${error.message}`,
          ),
          IO.map(constant(ExitStatus.failed)),
          T.fromIO,
        ),
      flow(
        IO.of,
        IO.chainFirst(
          flow(writeVulnerabilityResultToTerminal, constVoid, IO.of),
        ),
        IO.chain(failedVulnerabilities =>
          failedVulnerabilities.length
            ? IO.of(ExitStatus.failed)
            : pipe(
                info('NPM audit passed...'),
                IO.map(constant(ExitStatus.success)),
              ),
        ),
        T.fromIO,
      ),
    ),
  );

export const runAudit = (): RT.ReaderTask<AuditPipelineEnv, ExitStatus> =>
  pipe(
    RT.ask<AuditPipelineEnv>(),
    RT.chainTaskK(env =>
      pipe(
        env.getCommandLineArgs(),
        parseCommandLineArgs,
        TE.fromEither,
        TE.chain(config =>
          pipe(
            config,
            env.runNpmAuditCommand,
            TE.map(evaluateFailedVulnerabilities(config)),
          ),
        ),
        logResultToTerminal,
      ),
    ),
  );
