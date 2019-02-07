#!/usr/bin/env node
const { exec } = require('child_process');
const NpmAuditParser = require('./NpmAuditParser');
const AuditPipeline = require('./AuditPipeline');
const ArgsParser = require('./ArgsParser');
const NpmAuditor = require('./NpmAuditor');

const npmAuditParser = NpmAuditParser({ jsonParser: JSON });
const auditPipeline = AuditPipeline();
const argsParser = ArgsParser();

const npmAuditor = NpmAuditor({
  npmAuditParser,
  auditPipeline,
  argsParser,
  logger: console,
  process
});

// initialisation of app
exec(`npm audit --json`, (error, stdOut) => npmAuditor.runAudit(stdOut));
