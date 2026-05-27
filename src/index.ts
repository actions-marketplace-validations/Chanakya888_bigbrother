import Anthropic from '@anthropic-ai/sdk';
import * as core from '@actions/core';
import { buildPrompt } from './prompt';
import { config } from './config';
import { extractTestContext } from './tests';

async function postComment(token: string, owner: string, repo: string, prNumber: number, brief: string): Promise<void> {
  const body = `👁️ **Big Brother's read**\n\n${brief}\n\n---\n*Detailed review incoming from PR-Agent.*`;

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ body }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to post comment: ${response.status} ${response.statusText}`);
  }

  console.log('[bigbrother] Comment posted to PR successfully.');
}

async function run(): Promise<void> {
  const { prBody, anthropicApiKey: apiKey, githubToken, prNumber, repoOwner, repoName } = config;

  console.log(`[bigbrother] Running on PR #${prNumber} in ${repoOwner}/${repoName}`);

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set. Check your repository secrets.');
  }

  if (!githubToken) {
    throw new Error('GITHUB_TOKEN is not set.');
  }

  if (!prBody) {
    console.log('[bigbrother] No PR description found. Skipping summarization, PR-Agent will review without extra context.');
    core.setOutput('brief', '');
    return;
  }

  console.log(`[bigbrother] PR body length: ${prBody.length} chars`);

  // Extract test definitions from the PR diff if any exist
  let testContexts: Awaited<ReturnType<typeof extractTestContext>> = [];
  try {
    console.log('[bigbrother] Fetching PR file diff to extract test context...');
    testContexts = await extractTestContext(githubToken, repoOwner, repoName, prNumber);
    if (testContexts.length > 0) {
      console.log(`[bigbrother] Found tests in ${testContexts.length} file(s): ${testContexts.map(t => t.file).join(', ')}`);
    } else {
      console.log('[bigbrother] No test files found in this PR diff.');
    }
  } catch (err) {
    console.warn('[bigbrother] Could not extract test context (non-fatal):', (err as Error).message);
  }

  console.log('[bigbrother] Calling Claude to generate review brief...');
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 600,
    messages: [
      {
        role: 'user',
        content: buildPrompt(prBody, testContexts),
      },
    ],
  });

  const block = response.content[0];

  if (block.type !== 'text') {
    throw new Error(`Unexpected response block type: ${block.type}`);
  }

  console.log('[bigbrother] Brief generated successfully:');
  console.log(block.text);

  try {
    await postComment(githubToken, repoOwner, repoName, prNumber, block.text);
  } catch (err) {
    console.warn('[bigbrother] Could not post comment (non-fatal):', (err as Error).message);
  }

  core.setOutput('brief', block.text);
  console.log('[bigbrother] Output "brief" set. PR-Agent will use this as extra instructions.');
}

run().catch((err: Error) => {
  // Never block the review over a failed summarization — PR-Agent still runs, just without context.
  console.error('[bigbrother] ERROR: Summarization step failed.');
  console.error('[bigbrother] Reason:', err.message);
  if (err.stack) {
    console.error('[bigbrother] Stack:', err.stack);
  }
  console.error('[bigbrother] PR-Agent will proceed without extra context.');
  core.setOutput('brief', '');
});
