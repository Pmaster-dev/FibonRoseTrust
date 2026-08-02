/**
 * fibonrose-validator – Core validation logic
 *
 * Extracted from the inline GitHub Actions script in pinkycollie/mbtq-dev so
 * the same logic can be tested in isolation and reused across the mbtq ecosystem.
 */

/**
 * Pattern: "Confirm checkpoint <N>: <evidence>"  (case-insensitive)
 * @param {string} commentBody
 * @returns {{ checkpoint: string, evidence: string }[]}
 */
export function parseConfirmations(commentBody) {
  if (!commentBody) return [];
  const pattern = /confirm\s+checkpoint\s+(\d+):?\s*(.+)/gi;
  const matches = [...commentBody.matchAll(pattern)];
  return matches.map((m) => ({
    checkpoint: m[1],
    evidence: m[2].trim(),
  }));
}

/**
 * Mark a single checklist item as confirmed and append the evidence note.
 *
 * Matches lines of the form:
 *   - [ ] **Checkpoint N:** …
 * and replaces them with:
 *   - [x] **Checkpoint N:** …
 *   📝 _Confirmed: <evidence>_
 *
 * @param {string} issueBody
 * @param {string} checkpointNum
 * @param {string} evidence
 * @returns {string} updated issue body
 */
export function updateChecklist(issueBody, checkpointNum, evidence) {
  const pattern = new RegExp(
    `(- \\[[ ]\\] \\*\\*Checkpoint ${checkpointNum}:\\*\\*(.+))`,
    'i',
  );
  return issueBody.replace(
    pattern,
    `- [x] **Checkpoint ${checkpointNum}:**$2\n  📝 _Confirmed: ${evidence}_`,
  );
}

/**
 * Count total and confirmed checkpoints in an issue body.
 * @param {string} issueBody
 * @returns {{ total: number, confirmed: number }}
 */
export function getProgress(issueBody) {
  const total = (issueBody.match(/- \[[ x]\] \*\*Checkpoint \d+:/g) || []).length;
  const confirmed = (issueBody.match(/- \[x\] \*\*Checkpoint \d+:/g) || []).length;
  return { total, confirmed };
}

/**
 * Build the markdown comment that announces progress after a confirmation.
 * @param {number} confirmed
 * @param {number} total
 * @returns {string}
 */
export function buildProgressComment(confirmed, total) {
  const pct = total > 0 ? Math.round((confirmed / total) * 100) : 0;
  let body = `### 📊 Fibonrose Progress Update\n\n`;
  body += `✅ **${confirmed}/${total}** checkpoints confirmed\n`;
  body += `📈 **Progress:** ${pct}%\n\n`;

  if (confirmed === total && total > 0) {
    body += `🎉 **ALL CONFIRMATIONS COMPLETE!**\n\n`;
    body += `This task has been validated through the Fibonrose sequence.\n`;
    body += `Ready to close this issue! 🚀\n\n`;
  } else {
    const remaining = total - confirmed;
    body += `⏳ **${remaining} confirmation(s) remaining**\n\n`;
    body += `Keep up the great work! 💪\n\n`;
  }

  body += `_Automated by Fibonrose Task Validator_`;
  return body;
}

/**
 * Build the completion notification comment (posted when all checkpoints done).
 * @returns {string}
 */
export function buildCompletionComment() {
  return (
    `### 🌹 Task Completion Notification\n\n` +
    `**Congratulations!** This task has been fully validated through the Fibonrose sequence.\n\n` +
    `All checkpoints have been confirmed with evidence. This issue can now be safely closed.\n\n` +
    `Great work! 🎉🚀`
  );
}
