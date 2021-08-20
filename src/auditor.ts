import { NpmAuditorConfiguration } from './argsParser';
import { NpmAuditResponse } from './executorResponseHandler';

export enum Level {
  info = 'info',
  low = 'low',
  moderate = 'moderate',
  high = 'high',
  critical = 'critical',
}

export type LevelAudit = {
  level: Level;
  expectedCount: number;
  actualCount: number;
};

const configLevelValues = (config: NpmAuditorConfiguration) => ({
  [Level.info]: config.info,
  [Level.low]: config.low,
  [Level.moderate]: config.moderate,
  [Level.high]: config.high,
  [Level.critical]: config.critical,
});

const npmLevelValues = (npmAuditResponse: NpmAuditResponse) => ({
  [Level.info]: npmAuditResponse.info,
  [Level.low]: npmAuditResponse.low,
  [Level.moderate]: npmAuditResponse.moderate,
  [Level.high]: npmAuditResponse.high,
  [Level.critical]: npmAuditResponse.critical,
});

export const evaluateFailedVulnerabilities =
  (config: NpmAuditorConfiguration) =>
  (npmAuditResponse: NpmAuditResponse): ReadonlyArray<LevelAudit> =>
    Object.keys(Level)
      .map(x => ({
        level: x as Level,
        expectedCount: configLevelValues(config)[x as Level],
        actualCount: npmLevelValues(npmAuditResponse)[x as Level],
      }))
      .filter(x => x.actualCount > x.expectedCount);
