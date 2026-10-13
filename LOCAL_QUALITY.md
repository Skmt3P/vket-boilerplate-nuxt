# Local quality checks

For marked AI work, quality checks run on the checked-out commit on a developer machine. Unmarked human work runs the GitHub Actions quality jobs. The upstream sync workflow preserves the routing conditions.

1. Install the Bun version specified by `packageManager` and dependencies with
   `bun install --frozen-lockfile` at the repository root.
2. Commit the intended change. Keep the working tree clean.
3. Run `python3 scripts/local-quality.py`. It runs lint, typecheck, and coverage
   tests for base, derived-main, main, and showcases in sequence. Coverage runs
   the unit tests, so a separate `test:ut` pass is unnecessary.
4. Keep the JSON and log files reported under `../local-quality-evidence/` and
   attach or link them in the PR. Run `python3 scripts/local-quality.py --verify
   PATH_TO_JSON` before relying on that result. Verification rejects a changed
   commit, tree, lockfile, dirty checkout, or a missing/failed check.

The evidence records command exit values, log hashes, tool versions, commit,
tree, and lockfile hash. A source or lockfile change needs a fresh run.
