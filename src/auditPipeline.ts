import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';
import * as T from 'fp-ts/Task';
import { parseCommandLineArgs } from './argsParser';
import { evaluateFailedVulnerabilities, LevelAudit } from './auditor';
import { runNpmAuditCommand } from './executor';

const writeVulnerabilityResultToTerminal = (
  failedVulnerabilities: ReadonlyArray<LevelAudit>,
) =>
  failedVulnerabilities.map(x => {
    const { level, expectedCount, actualCount } = x;

    console.error('\x1b[31m', '\x1b[40m', 'NPM AUDIT FAILED');
    console.error(
      '\x1b[0m',
      '\x1b[33m',
      `For level: ${level}, the expected vulnerabilities should be ${expectedCount} but got ${actualCount}\n`,
    );
  });

export const runAudit = (): T.Task<void> =>
  pipe(
    process.argv.splice(2),
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
      error => {
        console.log('Failed to run npm audit pipeline', error);
        return process.exit(1);
      },
      failedVulnerabilities => {
        writeVulnerabilityResultToTerminal(failedVulnerabilities);
        return failedVulnerabilities.length ? process.exit(1) : process.exit(0);
      },
    ),
  );
