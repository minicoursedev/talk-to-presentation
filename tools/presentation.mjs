#!/usr/bin/env node
import {existsSync, readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {capabilityRoot, caseFile, readBrand} from './data-paths.mjs';
import {loadCase} from './contract.mjs';
import {checkVisuals} from './check-visuals.mjs';
import {stageNames, targets, stageInput, stageStatus, recordStage, audioIssues, htmlProtection} from './build-state.mjs';

const help = `Usage: node tools/presentation.mjs <command> [case-id] [options]
  validate <case-id>                 Check the shared source contract and assets
  status <case-id> [--json]           Read-only derived build status
  plan <case-id> --target <target>    Read-only rebuild plan
  rebuild <case-id> --target <target> Reuse current outputs; run needed stages
  check                             Run Node tests, document checks and smoke test
Targets: review, text, html, timeline, preview, video
Options: --json, --replace-html, --use-existing-html
Existing HTML is protected unless its unchanged generated output is tracked.
--replace-html explicitly authorizes the built-in HTML builders to overwrite it.
--use-existing-html preserves an independently maintained visual HTML.
No command generates voices or images, or marks human acceptance complete.`;
const python = process.env.PRESENTATION_PYTHON || (existsSync(resolve(capabilityRoot, '.venv/bin/python')) ? resolve(capabilityRoot, '.venv/bin/python') : 'python3');
function run(binary, args) {
  const result = spawnSync(binary, args, {stdio: 'inherit', env: {...process.env, PYTHONDONTWRITEBYTECODE: '1'}});
  if (result.error) throw result.error;
  if (result.status !== 0) throw Error(`Command failed (${result.status ?? result.signal}): ${binary} ${args.join(' ')}`);
}
const node = (name, ...args) => run(process.execPath, [resolve(capabilityRoot, 'tools', name), ...args]);
const py = (name, ...args) => run(python, [resolve(capabilityRoot, 'tools', name), ...args]);
function execute(stage, context, id) {
  switch (stage) {
    case 'review': node('review-script.mjs', id); break;
    case 'text': node('takahashi-html/build.mjs', id); break;
    case 'visual': node('visual-html/build.mjs', id); break;
    case 'timeline': py('voice.py', 'timeline', id); break;
    case 'prepare': node('prepare-motion.mjs', id); break;
    case 'prepare-preview': node('prepare-motion.mjs', id, '--preview'); break;
    case 'render': case 'render-preview':
      node('motion.mjs', 'build', id);
      node('render-video.mjs', id, ...(stage === 'render-preview' ? ['--preview'] : [])); break;
    case 'finish': py('finish_video.py', id, caseFile(context.dir, 'motion/output/presentation.mp4')); break;
    case 'verify': py('verify_video.py', id); break;
    case 'verify-preview': py('verify_video.py', id, '--preview', '--file', caseFile(context.dir, 'motion/output/preview.mp4')); break;
  }
}
try {
  const args = process.argv.slice(2), command = args.shift();
  if (!command || ['--help', '-h'].includes(command)) {console.log(help); process.exit(0);}
  if (command === 'check') {
    if (args.length) throw Error(help);
    run(process.execPath, ['--test', ...readdirSync(resolve(capabilityRoot, 'tools')).filter(name => name.endsWith('.test.mjs')).sort().map(name => resolve(capabilityRoot, 'tools', name))]);
    py('check_docs.py'); py('smoke_test.py');
    console.log('Regression checks passed. No speech generation, renderer or human acceptance was performed.');
  } else {
    if (!['validate', 'status', 'plan', 'rebuild'].includes(command)) throw Error(help);
    const id = args.shift(), options = {};
    while (args.length) {
      const flag = args.shift();
      if (flag === '--target') options.target = args.shift();
      else if (flag === '--json') options.json = true;
      else if (flag === '--replace-html') options.replaceHtml = true;
      else if (flag === '--use-existing-html') options.useExistingHtml = true;
      else throw Error(`Unknown option: ${flag}\n${help}`);
    }
    if (!id || (options.replaceHtml && options.useExistingHtml) || (command === 'rebuild' && options.json)) throw Error(help);
    if (['plan', 'rebuild'].includes(command) && !targets[options.target]) throw Error('Choose --target review|text|html|timeline|preview|video');
    let context = loadCase(id);
    const issues = [];
    try {await readBrand(); await checkVisuals(context.dir, context.meta, context.slides);} catch (error) {issues.push(error.message);}
    if (command === 'validate') {
      if (issues.length) throw Error(issues.join('\n'));
      console.log(JSON.stringify({case: id, pages: context.slides.length, sourceContract: 'valid', assetReferences: 'valid', acceptance: 'not assessed'}, null, 2));
    } else if (command === 'status') {
      const cache = new Map();
      const report = {case: id, sourceContract: 'valid', assets: issues, audio: audioIssues(context), stages: stageNames.map(stage => stageStatus(context, stage, options, cache)),
        decisions: 'content/draft.md', acceptance: 'Read case review records; build receipts do not establish visual or listening acceptance'};
      if (options.json) console.log(JSON.stringify(report, null, 2));
      else {
        console.log(`Case: ${id}`);
        for (const row of report.stages) console.log(`${row.stage.padEnd(17)} ${row.state.padEnd(12)} ${row.reason}`);
        for (const issue of [...report.assets, ...report.audio]) console.log(`INPUT: ${issue}`);
        console.log(`Decisions: ${report.decisions}\n${report.acceptance}`);
      }
    } else {
      const selected = targets[options.target];
      const steps = selected.map(stage => {
        const status = stageStatus(context, stage, options);
        return {...status, action: ['current', 'external'].includes(status.state) ? 'reuse' : 'run',
          blocker: status.state === 'unavailable' ? 'Required output is not configured' : htmlProtection(context, stage, options)};
      });
      const blockers = steps.map(s => s.blocker).filter(Boolean);
      if (selected.includes('visual')) blockers.push(...issues);
      if (selected.includes('timeline')) blockers.push(...audioIssues(context));
      const report = {case: id, target: options.target, steps, blockers};
      if (command === 'plan') {
        if (options.json) console.log(JSON.stringify(report, null, 2));
        else {
          for (const step of steps) console.log(`${step.action.padEnd(6)} ${step.stage.padEnd(17)} ${step.state}${step.blocker ? `: ${step.blocker}` : ''}`);
          for (const blocker of blockers) console.log(`BLOCKED: ${blocker}`);
        }
      } else {
        if (blockers.length) throw Error(blockers.join('\n'));
        let rebuilt = 0;
        for (const stage of selected) {
          context = loadCase(id);
          const status = stageStatus(context, stage, options);
          if (['current', 'external'].includes(status.state)) {console.log(`Reuse ${stage} (${status.state})`); continue;}
          const input = stageInput(context, stage);
          console.log(`Run ${stage}: ${status.reason}`);
          execute(stage, context, id);
          recordStage(loadCase(id), stage, input);
          rebuilt++;
        }
        console.log(`Completed ${options.target}: ${rebuilt} stages rebuilt; visual/listening acceptance remains separate.`);
      }
    }
  }
} catch (error) {console.error(error.message); process.exitCode = 1;}
