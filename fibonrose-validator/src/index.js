/**
 * fibonrose-validator – Action entry point
 *
 * Reads inputs from @actions/core, runs the validator logic, and makes the
 * required GitHub API calls via the github-client helpers.
 */

import * as core from '@actions/core';
import * as github from '@actions/github';
import {
  parseConfirmations,
  updateChecklist,
  getProgress,
  buildProgressComment,
  buildCompletionComment,
} from './validator.js';
import {
  getIssue,
  updateIssue,
  createComment,
  addLabels,
  listComments,
} from './github-client.js';

async function run() {
  try {
    const token = core.getInput('github-token', { required: true });
    const commentBody = core.getInput('comment-body');
    const issueNumber = parseInt(core.getInput('issue-number', { required: true }), 10);
    const labelName = core.getInput('label-name') || 'fibonrose';

    const octokit = github.getOctokit(token);
    const { owner, repo } = github.context.repo;

    // ── Step 1: parse confirmation patterns from the triggering comment ──────
    const confirmations = parseConfirmations(commentBody);

    if (confirmations.length === 0) {
      core.info('No "Confirm checkpoint N:" pattern found in comment — nothing to update.');
      return;
    }

    // ── Step 2: fetch the current issue body ─────────────────────────────────
    const issue = await getIssue(octokit, owner, repo, issueNumber);
    let issueBody = issue.body || '';
    let updated = false;

    // ── Step 3: apply each confirmation to the checklist ─────────────────────
    for (const { checkpoint, evidence } of confirmations) {
      const patternBefore = new RegExp(`- \\[[ ]\\] \\*\\*Checkpoint ${checkpoint}:\\*\\*`, 'i');
      if (patternBefore.test(issueBody)) {
        issueBody = updateChecklist(issueBody, checkpoint, evidence);
        updated = true;
        core.info(`Confirmed checkpoint ${checkpoint}: ${evidence}`);
      } else {
        core.warning(`Checkpoint ${checkpoint} not found or already confirmed — skipping.`);
      }
    }

    if (!updated) {
      core.info('No checklist items were changed.');
      return;
    }

    // ── Step 4: persist the updated issue body ────────────────────────────────
    await updateIssue(octokit, owner, repo, issueNumber, issueBody);

    // ── Step 5: post progress comment ────────────────────────────────────────
    const { total, confirmed } = getProgress(issueBody);
    const progressComment = buildProgressComment(confirmed, total);
    await createComment(octokit, owner, repo, issueNumber, progressComment);

    core.setOutput('confirmed', confirmed);
    core.setOutput('total', total);
    core.setOutput('complete', String(confirmed === total && total > 0));

    // ── Step 6: if all done, add completion label ─────────────────────────────
    if (confirmed === total && total > 0) {
      await addLabels(octokit, owner, repo, issueNumber, [`${labelName}:completed`]);
      core.info(`All ${total} checkpoints confirmed — added "${labelName}:completed" label.`);

      // Only post the completion notification once
      const comments = await listComments(octokit, owner, repo, issueNumber);
      const alreadyNotified = comments.some((c) =>
        c.body.includes('Task validated through Fibonrose!'),
      );
      if (!alreadyNotified) {
        await createComment(octokit, owner, repo, issueNumber, buildCompletionComment());
      }
    }
  } catch (error) {
    core.setFailed(`fibonrose-validator failed: ${error.message}`);
  }
}

run();
