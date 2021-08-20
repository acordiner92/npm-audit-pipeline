#!/usr/bin/env node
/* eslint-disable fp/no-unused-expression */
/* eslint-disable fp/no-nil */
import { exec } from 'child_process';
import { AuditPipelineEnv, ExitStatus, runAudit } from './auditPipeline';
import { ExecutorEnv, runNpmAuditCommand } from './executor';

const executorEnv: ExecutorEnv = {
  exec,
};

const auditPipelineEnv: AuditPipelineEnv = {
  getCommandLineArgs: () => process.argv.slice(2),
  runNpmAuditCommand: config => runNpmAuditCommand(config)(executorEnv),
};

const init = async (): Promise<void> => {
  const exitStatus = await runAudit()(auditPipelineEnv)();
  return exitStatus === ExitStatus.success ? process.exit(0) : process.exit(1);
};
void init();
