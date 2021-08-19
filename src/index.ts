import { exec } from 'child_process';
import { AuditPipelineEnv, runAudit } from './auditPipeline';
import { ExecutorEnv, runNpmAuditCommand } from './executor';

const executorEnv: ExecutorEnv = {
  exec,
};

const auditPipelineEnv: AuditPipelineEnv = {
  getCommandLineArgs: () => process.argv.slice(2),
  runNpmAuditCommand: config => runNpmAuditCommand(config)(executorEnv),
  exitProcess: (status: number) => process.exit(status),
};

// eslint-disable-next-line fp/no-unused-expression
void runAudit()(auditPipelineEnv)();
