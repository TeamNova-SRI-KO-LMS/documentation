# Performance Test Results

> **Placeholder — awaiting execution.**
> Deliverable §10.1 #9. This file is replaced wholesale by `npm run sync` once
> the k6 suite has been run and `reports/performance-report.md` exists in the
> testing repository. Nothing below is a measurement; the measurements do not
> exist yet, and inventing them would defeat the purpose of the deliverable.

---

## Why this file is empty

The performance suite is written, checked in and wired into CI. It has not been
executed on the machine that prepared this repository, because k6 is a
standalone Go binary rather than an npm dependency and was not installed there.

Everything needed to fill this file in is already committed:

| Piece | Where |
| --- | --- |
| Scenarios | `tests/performance/scenarios/{smoke,load,stress,spike}.js` (testing repo) |
| Shared helpers | `tests/performance/lib/` |
| Runner and report generator | `scripts/run-performance.js` |
| Thresholds | `testing.config.js` → `performance.thresholds` |
| CI job | `.github/workflows/performance.yml` |

## How to produce it

```bash
# 1. Install k6 (once)
brew install k6                     # macOS
winget install k6 --source winget   # Windows
# Linux: see the testing repository README

# 2. Start the application under test (staging is preferred — see below)
export PERF_BASE_URL=https://<staging-api-host>

# 3. Run the scenarios
cd <testing repo>
npm run test:perf          # smoke + load + spike
npm run test:perf -- --all # adds the six-minute stress scenario

# 4. Import the result here
cd <this repo>
npm run sync
npm run build:pdf -- documents/testing/performance-report.md
```

`npm run test:perf` writes `reports/performance/<scenario>-summary.json` and
renders `reports/performance-report.md`; `npm run sync` copies that file over
this placeholder, with a provenance banner.

> **Run it against staging, not localhost.** A laptop measures a laptop. §9.1
> requires the demonstration itself to run on the deployed staging environment,
> and the performance figures submitted alongside it should describe the same
> deployment the panel will be looking at. Record which environment produced
> the numbers — the generated report includes the target URL.

## What will be measured

| Scenario | Shape | Purpose |
| --- | --- | --- |
| `smoke` | 1 virtual user, 30 s | Confirms the scenario code and the target are healthy before spending time on load |
| `load` | Ramp to 50 concurrent users, sustained | The NFR-01 case: expected peak traffic with realistic think time |
| `spike` | Sudden jump to 4× nominal load | Whether the system degrades or collapses when a cohort logs in at once |
| `stress` | Ramp until thresholds break | Locates the ceiling, so capacity planning has a number rather than a hope |

## Thresholds that will be asserted

Taken from `testing.config.js`, which is also what the k6 run enforces — the
build fails if a threshold is breached, so these are gates, not aspirations.

| Threshold | Limit | Requirement |
| --- | --- | --- |
| Request failure rate | < 1 % | NFR-01 |
| Request duration, p95 | < 500 ms | NFR-01 |
| Request duration, p99 | < 1200 ms | NFR-01 |
| Login duration, p95 | < 800 ms | NFR-01 |

Login carries a looser bound on purpose. Authentication runs bcrypt at a work
factor chosen to be slow; a login endpoint that answers in 50 ms is a finding,
not an achievement.

## What the report will contain

The generator renders, per scenario: the target URL and start time, virtual
user profile, total requests, failure rate, latency percentiles (p50/p90/p95/p99),
per-endpoint breakdown, and a pass/fail line per threshold. The raw k6 summary
JSON is kept beside it so the numbers can be recomputed rather than trusted.
