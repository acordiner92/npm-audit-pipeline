import { flow, pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';
import * as T from 'fp-ts/Task';
import * as IO from 'fp-ts/IO';
import { info, error } from 'fp-ts/Console';
import { parseCommandLineArgs } from './argsParser';
import { evaluateFailedVulnerabilities, LevelAudit } from './auditor';
import { runNpmAuditCommand } from './executor';

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

export const runAudit = (): T.Task<void> =>
  pipe(
    process.argv.slice(2),
    parseCommandLineArgs,
    TE.fromEither,
    TE.chain(config =>
      pipe(
        config,
        runNpmAuditCommand,
        TE.map(evaluateFailedVulnerabilities(config)),
      ),
    ),
    TE.fold(
      error =>
        pipe(
          info(`Failed to run npm audit pipeline - Reason: ${error.message}`),
          process.exit(1),
        ),
      flow(writeVulnerabilityResultToTerminal, failedVulnerabilities =>
        failedVulnerabilities.length ? process.exit(1) : process.exit(0),
      ),
    ),
  );
