#!/usr/bin/env node
/**
 * Substitute the team roster into every document.
 *
 *   npm run fill-team          rewrite the placeholders in place
 *   npm run fill-team:check    fail if any placeholder is still unfilled
 *
 * Every document in this repository refers to the team through placeholders —
 * `[Student Name 1]`, `[Registration No. 2]`, `[Supervisor Name]`. The roster
 * is recorded in exactly one place, TEAM.md, and this script propagates it.
 *
 * Two properties matter:
 *
 *   1. A placeholder that has not been filled in stays *visible*. A cover page
 *      carrying `[Student Name 2]` is obviously incomplete; a cover page
 *      carrying a plausible but wrong name is not.
 *
 *   2. `--check` fails the build while any placeholder remains, so an
 *      unfinished cover page cannot reach a submission by being forgotten.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const { REPO_ROOT } = require('./repo');

const TEAM_FILE = path.join(REPO_ROOT, 'TEAM.md');

/** Directories never rewritten: generated copies and build output. */
const SKIP_DIRS = new Set(['node_modules', '.git', 'build', 'assets']);

/** Files never rewritten — they are the source, or they are generated. */
const SKIP_FILES = new Set(['TEAM.md']);

/** A synced artefact carries this marker; rewriting one would break sync:check. */
const SYNCED_MARKER = '<!-- SYNCED-ARTEFACT:START -->';

/**
 * Parse the roster out of TEAM.md.
 *
 * The tables are read positionally rather than by heading, because the headings
 * are prose and the tables are data. A row whose first cell is a digit is a
 * member row; `| Field | Value |` rows supply the single-valued fields.
 */
function readRoster() {
  if (!fs.existsSync(TEAM_FILE)) {
    throw new Error(`TEAM.md not found at ${TEAM_FILE}`);
  }

  const lines = fs.readFileSync(TEAM_FILE, 'utf8').split('\n');
  const roster = new Map();

  const cellsOf = (line) =>
    line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim().replace(/^`|`$/g, ''));

  for (const line of lines) {
    if (!line.trim().startsWith('|')) continue;
    const cells = cellsOf(line);

    // Member row: | 1 | Name | Reg | Role | GitHub | Email |
    if (cells.length >= 4 && /^\d+$/.test(cells[0])) {
      const n = cells[0];
      roster.set(`Student Name ${n}`, cells[1]);
      roster.set(`Registration No. ${n}`, cells[2]);
      roster.set(`Role ${n}`, cells[3]);
      if (cells[4]) roster.set(`@handle${n}`, cells[4]);
      if (cells[5]) roster.set(`email${n}`, cells[5]);
      continue;
    }

    // Field row: | Supervisor | Dr X |
    if (cells.length === 2) {
      const [field, value] = cells;
      if (field === 'Supervisor') roster.set('Supervisor Name', value);
      if (field === 'Client / Stakeholder') roster.set('Client Name / Organisation', value);
      if (field === 'Academic year') roster.set('YYYY/YYYY', value);
    }
  }

  // A value that is itself a placeholder has not been filled in.
  for (const [key, value] of roster) {
    if (/^\[.*\]$/.test(value) || value === '') roster.delete(key);
  }

  return roster;
}

function markdownFiles(dir, found = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      markdownFiles(path.join(dir, entry.name), found);
    } else if (entry.name.endsWith('.md') && !SKIP_FILES.has(entry.name)) {
      found.push(path.join(dir, entry.name));
    }
  }
  return found;
}

/** Every `[Placeholder]` and `` `[Placeholder]` `` occurrence in a document. */
function placeholdersIn(text) {
  const found = new Set();
  const pattern = /`?\[([^\]\n]{2,60})\]`?/g;
  let match = pattern.exec(text);
  while (match !== null) {
    const inner = match[1];
    // Markdown links are `[text](url)` — not placeholders.
    const after = text.slice(match.index + match[0].length, match.index + match[0].length + 1);
    if (after !== '(' && !/^[ x]$/.test(inner)) found.add(inner);
    match = pattern.exec(text);
  }
  return found;
}

function main() {
  const checkOnly = process.argv.includes('--check');
  const roster = readRoster();

  if (roster.size === 0 && !checkOnly) {
    process.stderr.write(
      [
        '',
        '  TEAM.md still contains only placeholders.',
        '',
        '  Fill in the member table and the project fields, then run this again.',
        '  Until then the placeholders stay visible in every document, which is',
        '  the intended behaviour — a cover page with [Student Name 2] on it is',
        '  obviously unfinished.',
        '',
      ].join('\n'),
    );
    process.exit(1);
  }

  const files = markdownFiles(REPO_ROOT);
  const rewritten = [];
  const unfilled = new Map();

  for (const file of files) {
    const original = fs.readFileSync(file, 'utf8');
    if (original.includes(SYNCED_MARKER)) continue;

    let updated = original;
    for (const [placeholder, value] of roster) {
      updated = updated
        .split('`[' + placeholder + ']`')
        .join(value)
        .split('[' + placeholder + ']')
        .join(value);
    }

    if (updated !== original && !checkOnly) {
      fs.writeFileSync(file, updated);
      rewritten.push(path.relative(REPO_ROOT, file));
    }

    const remaining = placeholdersIn(checkOnly ? original : updated);
    if (remaining.size > 0) {
      unfilled.set(path.relative(REPO_ROOT, file), [...remaining]);
    }
  }

  if (!checkOnly) {
    process.stdout.write(`\n  Roster entries applied: ${roster.size}\n`);
    process.stdout.write(`  Files rewritten: ${rewritten.length}\n`);
    for (const file of rewritten) process.stdout.write(`    ${file}\n`);
  }

  if (unfilled.size > 0) {
    const total = [...unfilled.values()].reduce((sum, list) => sum + list.length, 0);
    process.stdout.write(`\n  ${total} placeholder(s) still unfilled in ${unfilled.size} file(s):\n\n`);
    for (const [file, list] of unfilled) {
      process.stdout.write(`    ${file}\n`);
      for (const item of list.slice(0, 6)) process.stdout.write(`      [${item}]\n`);
      if (list.length > 6) process.stdout.write(`      … and ${list.length - 6} more\n`);
    }
    process.stdout.write(
      [
        '',
        '  Not all of these come from TEAM.md. Many are prompts for the team’s own',
        '  record — sprint dates, client feedback, the lessons each member will',
        '  present. They are deliberately blank rather than invented.',
        '',
      ].join('\n'),
    );
    if (checkOnly) process.exit(1);
    return;
  }

  process.stdout.write('\n  ✓ No placeholders remain.\n\n');
}

main();
