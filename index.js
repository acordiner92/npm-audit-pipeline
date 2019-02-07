const { exec } = require('child_process');
const AuditJsonParser = require('./NpmAuditParser');
const AuditPipeline = require('./AuditPipeline');
const ArgsParser = require('./ArgsParser');

const auditJsonParser = AuditJsonParser();
const auditPipeline = AuditPipeline();
const argsParser = ArgsParser();

const npmAuditor = NpmAuditor({
  auditJsonParser,
  auditPipeline,
  argsParser,
  logger: console.log,
  process
});

// initialisation of app
exec(`npm audit --json`, (...args) => npmAuditor.runAudit(...args));
