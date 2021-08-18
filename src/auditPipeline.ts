import { flow, pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';
import * as RT from 'fp-ts/ReaderTask';
import * as IO from 'fp-ts/IO';
import { info, error } from 'fp-ts/Console';
import { NpmAuditorConfiguration, parseCommandLineArgs } from './argsParser';
import { evaluateFailedVulnerabilities, LevelAudit } from './auditor';

type AuditPipelineEnv = {
  getCommandLineArgs: () => ReadonlyArray<string>;
  runNpmAuditCommand: (config: NpmAuditorConfiguration) => TE.TaskEither<
    Error,
    {
      metaData: {
        vulnerabilities: {
          info: number;
          low: number;
          moderate: number;
          high: number;
          critical: number;
        };
      };
    }
  >;
  exitProcess: (status: number) => never;
};

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
    );
  });

export const runAudit = (): RT.ReaderTask<AuditPipelineEnv, void> =>
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
        TE.fold(
          error =>
            pipe(
              info(
                `Failed to run npm audit pipeline - Reason: ${error.message}`,
              ),
              env.exitProcess(1),
            ),
          flow(writeVulnerabilityResultToTerminal, failedVulnerabilities =>
            failedVulnerabilities.length
              ? env.exitProcess(1)
              : env.exitProcess(0),
          ),
        ),
      ),
    ),
  );
