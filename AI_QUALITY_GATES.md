# AI and human quality gates

Human GitHub changes run the GitHub Actions quality jobs. AI work uses `ai/` as the branch prefix and `[AI]` at the start of the PR title. For direct AI pushes to a protected branch, put `[AI]` in the pushed head commit message. Do not mark a human change as AI. An unmarked change runs the hosted gate. These markers identify the work by convention because both operators use the same GitHub account.

## Before any AI push

On the exact clean candidate commit, run `python3 scripts/local-quality.py` and verify its evidence with `python3 scripts/local-quality.py --verify PATH_TO_JSON`; it checks lint, typecheck, and coverage tests for every layer. Record the commit SHA and results before push.

A changed commit, skipped check, failed check, or stale evidence blocks the AI push. Review the exact commands and outputs in the PR description. An AI edit made through GitHub's web UI cannot use the local gate and must retain the hosted checks unless equivalent exact-commit local evidence already exists.

## Branch protection

Keep required check names in place. Job-level skips report a skipped check, while workflow-level filters can leave required checks pending. The OmusBridge consolidated workflow keeps its required and compatibility checks and accepts a skipped source job only for marked AI PRs.
