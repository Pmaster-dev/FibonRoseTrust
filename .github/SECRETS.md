# Repository Secrets & PAT Setup

This document lists every secret that must be configured in
**Settings → Secrets and variables → Actions** for the automation
workflows in this repository to work correctly.

---

## Required Secrets

### `GH_PAT` — GitHub Personal Access Token  *(most important)*

Several workflows need elevated permissions that `GITHUB_TOKEN` cannot
provide (e.g. triggering other workflows from a release, auto-merging PRs,
deleting branches in some org configurations).

**How to create it:**

1. Go to **GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)**
2. Click **Generate new token (classic)**
3. Give it a descriptive name: `FibonRoseTrust automation`
4. Set expiry to **90 days** (rotate regularly)
5. Select these scopes:

   | Scope | Why |
   |---|---|
   | `repo` | Read/write repo contents, PRs, issues, branches |
   | `workflow` | Allow triggering other workflow runs |

6. Click **Generate token** and copy it immediately
7. In this repo: **Settings → Secrets → New repository secret**
   - Name: `GH_PAT`
   - Value: *(paste the token)*

> **Fallback:** Every workflow that uses `GH_PAT` falls back to
> `GITHUB_TOKEN` automatically (`${{ secrets.GH_PAT || secrets.GITHUB_TOKEN }}`),
> so CI will still run without it — just with reduced capabilities.

---

### `CODECOV_TOKEN` — Code coverage upload  *(optional)*

Used by `ci.yml` to upload coverage reports to [codecov.io](https://codecov.io).

1. Sign in to codecov.io with your GitHub account
2. Add the `Pmaster-dev/FibonRoseTrust` repository
3. Copy the **Repository Upload Token**
4. Add as repo secret named `CODECOV_TOKEN`

> If not set, the upload step uses `fail_ci_if_error: false` so CI still passes.

---

### `SEMGREP_APP_TOKEN` — Semgrep SAST  *(optional)*

Used by `semgrep.yml`. Follow the [Semgrep docs](https://semgrep.dev/docs/semgrep-ci/running-semgrep-ci-with-a-semgrep-app-token/)
to obtain a token and add it as `SEMGREP_APP_TOKEN`.

---

## Workflow → Secret mapping

| Workflow | Secret used | Fallback if missing |
|---|---|---|
| `ci.yml` | `CODECOV_TOKEN` | Upload step skipped gracefully |
| `auto-merge.yml` | `GH_PAT` | Falls back to `GITHUB_TOKEN` |
| `release.yml` | `GH_PAT` | Falls back to `GITHUB_TOKEN` (release won't trigger downstream workflows) |
| `branch-cleanup.yml` | `GH_PAT` | Falls back to `GITHUB_TOKEN` |
| `semgrep.yml` | `SEMGREP_APP_TOKEN` | Semgrep run fails |
| All others | `GITHUB_TOKEN` *(automatic)* | — |

---

## Recommended: Enable auto-merge at the repository level

For `auto-merge.yml` to work, auto-merge must be enabled in the repo settings:

**Settings → General → Pull Requests → Allow auto-merge** ✅

## Recommended: Branch protection on `main`

**Settings → Branches → Add rule** for `main`:

- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging
  - Required checks: `Type check`, `Tests (Node 20.x)`, `Tests (Node 22.x)`, `Build`
- ✅ Require branches to be up to date before merging
- ✅ Do not allow bypassing the above settings
