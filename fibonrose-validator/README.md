# fibonrose-validator

A reusable GitHub Action that validates task checkpoints via Fibonacci-inspired
confirmation patterns. Part of the [mbtq ecosystem](https://github.com/pinkycollie/mbtq-dev).

## How it works

1. A contributor leaves a comment like `Confirm checkpoint 3: Added unit tests`.
2. The action finds the matching `- [ ] **Checkpoint 3:** …` item in the issue body
   and marks it `- [x]`, appending the evidence note.
3. A progress comment is posted showing how many checkpoints remain.
4. When all checkpoints are confirmed, a `fibonrose:completed` label is added and a
   completion notification is posted.

## Usage

```yaml
- name: Run Fibonrose Validator
  uses: ./fibonrose-validator          # local action (this repo)
  # or:  uses: Pmaster-dev/FibonRoseTrust/fibonrose-validator@main
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    comment-body: ${{ github.event.comment.body }}
    issue-number: ${{ github.event.issue.number }}
    label-name: fibonrose              # optional, default: fibonrose
```

See [`.github/workflows/fibonrose-validator.yml`](../.github/workflows/fibonrose-validator.yml)
for the full workflow that uses this action.

## Inputs

| Name            | Required | Default      | Description                               |
|-----------------|----------|--------------|-------------------------------------------|
| `github-token`  | ✅       |              | GitHub token for API access               |
| `comment-body`  | ✅       |              | Body of the comment that triggered the run |
| `issue-number`  | ✅       |              | Issue number to update                    |
| `label-name`    |          | `fibonrose`  | Base label name                           |

## Outputs

| Name        | Description                                           |
|-------------|-------------------------------------------------------|
| `confirmed` | Number of confirmed checkpoints after this run        |
| `total`     | Total number of checkpoints in the issue              |
| `complete`  | `"true"` when all checkpoints are confirmed           |

## Confirmation pattern

Comments must include:

```
Confirm checkpoint <N>: <evidence description>
```

Example: `Confirm checkpoint 2: All API routes documented and tested`

Multiple confirmations can appear in a single comment, one per line.

## Development

```bash
cd fibonrose-validator

# Install dependencies
npm install

# Run tests
npm test

# Bundle for release (outputs to dist/)
npm run build
```

The `dist/` folder is committed so the action works without a separate build step
in consumer workflows.

## Extending to the broader ecosystem

- Point `uses:` at a tag (`@v1`) once published to a central actions repo so all
  mbtq services (DeafAuth, PinkSync, …) can reference a single validated copy.
- Hook the `complete` output into downstream workflows (model deployment, trust-score
  updates via the Fibonrose API, etc.).
