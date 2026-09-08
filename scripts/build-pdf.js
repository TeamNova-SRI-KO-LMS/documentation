#!/usr/bin/env node
/**
 * Render Markdown deliverables to print-ready HTML, and to PDF where a browser
 * is available.
 *
 *   npm run build:pdf -- documents/srs/srs-final.md
 *   npm run build:pdf:all
 *
 * §10.1 asks for PDFs at specific paths — `documents/srs/srs-final.pdf`,
 * `documents/testing/test-register.pdf`, and so on. The Markdown is the source
 * of truth; the PDF is a rendering of it, produced by this script and written
 * to `build/pdf/`, which is git-ignored.
 *
 * Two stages, deliberately separable:
 *
 *   Markdown ──markdown-it──► HTML (+ print.css)  ──Chromium──► PDF
 *
 * The HTML stage has no browser dependency, so it always runs. If Chromium is
 * not installed the script still produces the HTML and explains the one command
 * that unlocks the second stage, rather than failing with a stack trace.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const { REPO_ROOT } = require('./repo');

const OUT_DIR = path.join(REPO_ROOT, 'build', 'pdf');
const HTML_DIR = path.join(REPO_ROOT, 'build', 'html');
const STYLESHEET = path.join(REPO_ROOT, 'assets', 'styles', 'print.css');

/**
 * The §10.1 deliverables, in submission order. `--all` builds exactly this
 * list, so "did we render everything?" is answered by the script rather than
 * by memory.
 */
const DELIVERABLES = [
  { source: 'documents/srs/srs-final.md', item: '§10.1 #1 — Updated SRS' },
  { source: 'documents/sds/sds-final.md', item: '§10.1 #2 — Updated SDS' },
  { source: 'documents/report/final-development-report.md', item: '§10.1 #3 — Final Development Report' },
  { source: 'documents/testing/coverage-sprint8.md', item: '§10.1 #6 — Test Coverage Report' },
  { source: 'documents/testing/test-register.md', item: '§10.1 #7 — Test Case Register' },
  { source: 'documents/security/owasp-checklist.md', item: '§10.1 #8 — OWASP Compliance Evidence' },
  { source: 'documents/testing/performance-report.md', item: '§10.1 #9 — Performance Test Results' },
  { source: 'documents/forms/peer-evaluation-form.md', item: '§10.1 #12 — Peer Evaluation Form (blank)' },
];

function loadRenderer() {
  let MarkdownIt;
  try {
    // eslint-disable-next-line global-require
    MarkdownIt = require('markdown-it');
  } catch {
    process.stderr.write(
      [
        '',
        '  markdown-it is not installed.',
        '',
        '    npm install',
        '',
      ].join('\n'),
    );
    process.exit(1);
  }

  const md = new MarkdownIt({ html: true, linkify: true, typographer: true });

  // Anchors, so the tables of contents in the SRS, SDS and report work in the
  // rendered output as well as on GitHub.
  // Matches GitHub's algorithm, including the part that trips people up: each
  // whitespace character becomes one hyphen and runs are not collapsed, so
  // `TC-01 — Something` anchors as `tc-01--something`. Tables of contents in
  // these documents are written for GitHub, so the PDF has to agree with it.
  const slugify = (text) =>
    text
      .replace(/`/g, '')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s_-]/gu, '')
      .replace(/\s/g, '-');

  const defaultHeadingOpen =
    md.renderer.rules.heading_open ||
    ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));

  md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
    const inline = tokens[idx + 1];
    if (inline && inline.type === 'inline') {
      tokens[idx].attrSet('id', slugify(inline.content));
    }
    return defaultHeadingOpen(tokens, idx, options, env, self);
  };

  return md;
}

function pageTitle(markdown, fallback) {
  const frontmatter = markdown.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatter) {
    const title = frontmatter[1].match(/^title:\s*(.+)$/m);
    if (title) return title[1].trim();
  }
  const heading = markdown.match(/^#\s+(.+)$/m);
  return heading ? heading[1].trim() : fallback;
}

/** YAML frontmatter is metadata for this script, not content for the page. */
function stripFrontmatter(markdown) {
  return markdown.replace(/^---\n[\s\S]*?\n---\n/, '');
}

function wrap(title, body, css) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
${css}
</style>
</head>
<body>
<main class="document">
${body}
</main>
</body>
</html>
`;
}

/**
 * Find a browser to print with.
 *
 * Playwright's own Chromium is preferred because it is version-pinned, so the
 * PDF a student produces matches the one CI produces. But downloading it is a
 * 120 MB step that fails on a metered or filtered connection, and most machines
 * already have Chrome or Edge installed — printing through one of those gives
 * the same output for zero download. Trying them in this order means the common
 * case needs no setup at all.
 */
async function launchBrowser(chromium) {
  const attempts = [
    { label: 'bundled Chromium', options: {} },
    { label: 'system Chrome', options: { channel: 'chrome' } },
    { label: 'system Edge', options: { channel: 'msedge' } },
  ];

  for (const attempt of attempts) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const browser = await chromium.launch(attempt.options);
      return { browser, label: attempt.label };
    } catch {
      // Try the next one. The caller reports failure only if all of them fail.
    }
  }

  return null;
}

async function renderPdf(htmlPath, pdfPath, title) {
  let chromium;
  try {
    // eslint-disable-next-line global-require
    ({ chromium } = require('playwright'));
  } catch {
    return { ok: false, reason: 'playwright-missing' };
  }

  const launched = await launchBrowser(chromium);
  if (!launched) {
    return { ok: false, reason: 'browser-missing' };
  }
  const { browser, label } = launched;

  try {
    const page = await browser.newPage();
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '18mm', right: '18mm' },
      displayHeaderFooter: true,
      headerTemplate: `<div style="font-size:8pt;color:#666;width:100%;padding:0 18mm;">${title}</div>`,
      footerTemplate:
        '<div style="font-size:8pt;color:#666;width:100%;padding:0 18mm;text-align:center;">' +
        'SENG 34213 — SRI-KO LMS · <span class="pageNumber"></span> / <span class="totalPages"></span>' +
        '</div>',
    });
    return { ok: true, engine: label };
  } finally {
    await browser.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const all = args.includes('--all');
  const htmlOnly = args.includes('--html');
  const explicit = args.filter((arg) => !arg.startsWith('--'));

  const targets = all
    ? DELIVERABLES
    : explicit.map((source) => ({ source, item: null }));

  if (targets.length === 0) {
    process.stdout.write(
      [
        '',
        '  Usage:',
        '    npm run build:pdf -- <path/to/file.md> [more.md ...]',
        '    npm run build:pdf:all',
        '',
        '  §10.1 deliverables built by --all:',
        ...DELIVERABLES.map((entry) => `    ${entry.source.padEnd(52)} ${entry.item}`),
        '',
      ].join('\n'),
    );
    return;
  }

  const md = loadRenderer();
  const css = fs.existsSync(STYLESHEET) ? fs.readFileSync(STYLESHEET, 'utf8') : '';

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(HTML_DIR, { recursive: true });

  let pdfUnavailable = null;
  let engine = null;
  const built = [];
  const skipped = [];

  for (const target of targets) {
    const sourcePath = path.resolve(REPO_ROOT, target.source);
    if (!fs.existsSync(sourcePath)) {
      skipped.push({ target, reason: 'not found' });
      continue;
    }

    const base = path.basename(target.source, '.md');
    const markdown = fs.readFileSync(sourcePath, 'utf8');
    const title = pageTitle(markdown, base);
    const html = wrap(title, md.render(stripFrontmatter(markdown)), css);

    const htmlPath = path.join(HTML_DIR, `${base}.html`);
    fs.writeFileSync(htmlPath, html);

    if (htmlOnly || pdfUnavailable) {
      built.push({ target, html: htmlPath, pdf: null });
      continue;
    }

    const pdfPath = path.join(OUT_DIR, `${base}.pdf`);
    // eslint-disable-next-line no-await-in-loop
    const result = await renderPdf(htmlPath, pdfPath, title);

    if (result.ok) {
      engine = result.engine;
      built.push({ target, html: htmlPath, pdf: pdfPath });
    } else {
      pdfUnavailable = result.reason;
      built.push({ target, html: htmlPath, pdf: null });
    }
  }

  process.stdout.write('\n');
  for (const entry of built) {
    const output = entry.pdf
      ? path.relative(REPO_ROOT, entry.pdf)
      : `${path.relative(REPO_ROOT, entry.html)}  (HTML only)`;
    process.stdout.write(`  ✓ ${entry.target.source}\n      → ${output}\n`);
  }
  for (const entry of skipped) {
    process.stdout.write(`  – ${entry.target.source}  (${entry.reason})\n`);
  }

  if (pdfUnavailable) {
    const remedy =
      pdfUnavailable === 'playwright-missing'
        ? 'npm install'
        : [
            'npm run build:install     # downloads Chromium (~120 MB)',
            '',
            '  — or install Google Chrome or Microsoft Edge, which this script',
            '  will use instead if it finds one. No download step either way.',
          ].join('\n');
    process.stdout.write(
      [
        '',
        '  PDF rendering is unavailable, so only HTML was produced.',
        '',
        `    ${remedy}`,
        '',
        '  The HTML in build/html/ is print-ready: opening it in a browser and',
        '  choosing "Save as PDF" produces the same document, with the same',
        '  page setup, if installing Chromium is not convenient.',
        '',
      ].join('\n'),
    );
  } else {
    process.stdout.write(`\n  Rendered with ${engine}.\n\n`);
  }
}

main().catch((error) => {
  process.stderr.write(`\n  ✗ ${error.message}\n\n`);
  process.exit(1);
});
