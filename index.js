#!/usr/bin/env node
const { exec } = require('child_process');
const AuditPipeline = require('./AuditPipeline');
const ArgsParser = require('./ArgsParser');
const NpmAuditor = require('./NpmAuditor');
const Executor = require('./executor');

const auditPipeline = AuditPipeline();
const argsParser = ArgsParser();

const executor = Executor({
  exec,
  jsonParser: JSON,
  logger: console
});

const npmAuditor = NpmAuditor({
  auditPipeline,
  argsParser,
  logger: console,
  process,
  executor
});

// initialisation of app
npmAuditor.runAudit();
