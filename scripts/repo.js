/**
 * Locating the sibling repositories.
 *
 * This repository holds documentation; the artefacts it must publish —
 * the test register, the coverage summary, the OWASP evidence — are *generated*
 * by the testing repository. Copying them by hand is how a submitted PDF ends
 * up claiming 95 % coverage on a suite that has since moved to 81 %.
 *
 * So the path is resolved once, here, from (in order):
 *
 *   1. the TESTING_REPO environment variable
 *   2. a `.testing-repo` file in this repository (git-ignored, one line)
 *   3. a list of conventional sibling locations
 *
 * and every script goes through it. Nothing else contains a path.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');

/** Marker files that identify a directory as the testing repository. */
const TESTING_REPO_MARKERS = ['testing.config.js', path.join('scripts', 'check-coverage.js')];

/** Conventional locations, relative to this repository's root. */
const CANDIDATE_PATHS = [
  '../../SRI-KO_Testing/testing',
  '../SRI-KO_Testing/testing',
  '../testing',
  '../../testing',
];

class TestingRepoNotFoundError extends Error {
  constructor(tried) {
    super(
      [
        '',
        '  Could not locate the testing repository.',
        '',
        '  It is the source of the generated artefacts this repository publishes:',
        '  the test register, the coverage summary, the endpoint report and the',
        '  OWASP evidence.',
        '',
        '  Tried, in order:',
        ...tried.map((entry) => `    ${entry.source.padEnd(22)} ${entry.dir}`),
        '',
        '  Fix it with any one of:',
        '',
        '    export TESTING_REPO=/absolute/path/to/SRI-KO_Testing/testing',
        '    echo /absolute/path/to/SRI-KO_Testing/testing > .testing-repo',
        '    git clone https://github.com/TeamNova-SRI-KO-LMS/testing.git ../../SRI-KO_Testing/testing',
        '',
      ].join('\n'),
    );
    this.name = 'TestingRepoNotFoundError';
    this.tried = tried;
  }
}

function looksLikeTestingRepo(dir) {
  return TESTING_REPO_MARKERS.every((marker) => fs.existsSync(path.join(dir, marker)));
}

function candidates() {
  const tried = [];

  if (process.env.TESTING_REPO) {
    tried.push({ source: 'TESTING_REPO', dir: path.resolve(process.env.TESTING_REPO) });
  }

  const pointer = path.join(REPO_ROOT, '.testing-repo');
  if (fs.existsSync(pointer)) {
    const declared = fs.readFileSync(pointer, 'utf8').trim();
    if (declared) {
      tried.push({ source: '.testing-repo', dir: path.resolve(REPO_ROOT, declared) });
    }
  }

  for (const candidate of CANDIDATE_PATHS) {
    tried.push({ source: 'convention', dir: path.resolve(REPO_ROOT, candidate) });
  }

  return tried;
}

let cached = null;

/**
 * Absolute path to the testing repository.
 *
 * @param {{ optional?: boolean }} [options] when `optional`, returns null
 *   instead of throwing — used by commands that can degrade gracefully.
 * @returns {string|null}
 */
function testingRepo(options = {}) {
  if (cached) return cached;

  const tried = candidates();
  const found = tried.find((entry) => looksLikeTestingRepo(entry.dir));
  if (found) {
    cached = found.dir;
    return cached;
  }

  if (options.optional) return null;
  throw new TestingRepoNotFoundError(tried);
}

module.exports = { REPO_ROOT, testingRepo, TestingRepoNotFoundError };
