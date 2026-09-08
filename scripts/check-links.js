#!/usr/bin/env node
/**
 * Verify that every relative link in the documentation resolves.
 *
 *   npm run links
 *
 * Cross-references are what make a set of documents usable rather than a pile
 * of files: the report points at the register, the register points at the
 * defects, the defects point at the ADRs. A dead link breaks that chain
 * silently — GitHub renders it, it just 404s when somebody follows it, and
 * nobody follows it until the viva.
 *
 * Only relative links are checked. External URLs are not fetched: a network
 * check turns a deterministic gate into a flaky one, and a link to
 * `owasp.org` failing in CI says nothing about this repository.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const { REPO_ROOT } = require('./repo');

const SKIP_DIRS = new Set(['node_modules', '.git', 'build']);

function markdownFiles(dir, found = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      markdownFiles(path.join(dir, entry.name), found);
    } else if (entry.name.endsWith('.md')) {
      found.push(path.join(dir, entry.name));
    }
  }
  return found;
}

/**
 * GitHub's heading-anchor algorithm.
 *
 * The subtle part is the last step: each whitespace character becomes one
 * hyphen, and runs are *not* collapsed. A heading like `TC-01 — Something`
 * loses the em dash but keeps both surrounding spaces, so its anchor is
 * `tc-01--something` with two hyphens. Collapsing them produces an anchor that
 * looks right and resolves to nothing.
 */
function slugify(heading) {
  return heading
    .replace(/`/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links contribute their text only
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s/g, '-');
}

function anchorsIn(markdown) {
  const anchors = new Set();
  const seen = new Map();
  for (const line of markdown.split('\n')) {
    const heading = line.match(/^#{1,6}\s+(.+?)\s*$/);
    if (!heading) continue;
    const base = slugify(heading[1]);
    const count = seen.get(base) || 0;
    seen.set(base, count + 1);
    anchors.add(count === 0 ? base : `${base}-${count}`);
  }
  return anchors;
}

/** Markdown inline links, skipping fenced code blocks. */
function linksIn(markdown) {
  const withoutFences = markdown.replace(/^```[\s\S]*?^```/gm, '');
  const links = [];
  const pattern = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  let match = pattern.exec(withoutFences);
  while (match !== null) {
    links.push(match[1]);
    match = pattern.exec(withoutFences);
  }
  return links;
}

function main() {
  const files = markdownFiles(REPO_ROOT);
  const anchorCache = new Map();

  const anchorsFor = (file) => {
    if (!anchorCache.has(file)) {
      anchorCache.set(file, anchorsIn(fs.readFileSync(file, 'utf8')));
    }
    return anchorCache.get(file);
  };

  const broken = [];
  let checked = 0;

  for (const file of files) {
    const markdown = fs.readFileSync(file, 'utf8');
    const dir = path.dirname(file);

    for (const link of linksIn(markdown)) {
      if (/^(https?:|mailto:|tel:)/.test(link)) continue;

      checked += 1;
      const [target, fragment] = link.split('#');

      // A pure fragment refers to a heading in this same file.
      if (target === '') {
        if (fragment && !anchorsFor(file).has(fragment)) {
          broken.push({ file, link, reason: 'no such heading in this file' });
        }
        continue;
      }

      const resolved = path.resolve(dir, decodeURIComponent(target));
      if (!fs.existsSync(resolved)) {
        broken.push({ file, link, reason: 'file not found' });
        continue;
      }

      if (fragment && resolved.endsWith('.md') && !anchorsFor(resolved).has(fragment)) {
        broken.push({ file, link, reason: 'no such heading in target' });
      }
    }
  }

  const rel = (file) => path.relative(REPO_ROOT, file);

  if (broken.length > 0) {
    process.stderr.write(`\n  ✗ ${broken.length} broken link(s) in ${files.length} files:\n\n`);
    let current = null;
    for (const item of broken) {
      if (item.file !== current) {
        current = item.file;
        process.stderr.write(`    ${rel(item.file)}\n`);
      }
      process.stderr.write(`      ${item.link}  — ${item.reason}\n`);
    }
    process.stderr.write('\n');
    process.exit(1);
  }

  process.stdout.write(
    `\n  ✓ ${checked} relative link(s) across ${files.length} files all resolve.\n\n`,
  );
}

main();
