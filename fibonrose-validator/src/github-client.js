/**
 * fibonrose-validator – GitHub API helpers
 *
 * Thin wrappers around Octokit REST methods so the action entry point stays
 * focused on orchestration and the GitHub API calls are easy to mock in tests.
 */

/**
 * @param {import('@octokit/rest').Octokit} octokit
 * @param {string} owner
 * @param {string} repo
 * @param {number} issueNumber
 */
export async function getIssue(octokit, owner, repo, issueNumber) {
  const { data } = await octokit.rest.issues.get({
    owner,
    repo,
    issue_number: issueNumber,
  });
  return data;
}

/**
 * @param {import('@octokit/rest').Octokit} octokit
 * @param {string} owner
 * @param {string} repo
 * @param {number} issueNumber
 * @param {string} body
 */
export async function updateIssue(octokit, owner, repo, issueNumber, body) {
  await octokit.rest.issues.update({
    owner,
    repo,
    issue_number: issueNumber,
    body,
  });
}

/**
 * @param {import('@octokit/rest').Octokit} octokit
 * @param {string} owner
 * @param {string} repo
 * @param {number} issueNumber
 * @param {string} body
 */
export async function createComment(octokit, owner, repo, issueNumber, body) {
  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: issueNumber,
    body,
  });
}

/**
 * @param {import('@octokit/rest').Octokit} octokit
 * @param {string} owner
 * @param {string} repo
 * @param {number} issueNumber
 * @param {string[]} labels
 */
export async function addLabels(octokit, owner, repo, issueNumber, labels) {
  await octokit.rest.issues.addLabels({
    owner,
    repo,
    issue_number: issueNumber,
    labels,
  });
}

/**
 * @param {import('@octokit/rest').Octokit} octokit
 * @param {string} owner
 * @param {string} repo
 * @param {number} issueNumber
 * @returns {Promise<Array>}
 */
export async function listComments(octokit, owner, repo, issueNumber) {
  const { data } = await octokit.rest.issues.listComments({
    owner,
    repo,
    issue_number: issueNumber,
  });
  return data;
}
