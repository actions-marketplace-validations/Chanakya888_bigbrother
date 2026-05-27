import Anthropic from '@anthropic-ai/sdk';
import * as core from '@actions/core';
import { buildPrompt } from './prompt';
import { config } from './config';
import { extractTestContext } from './tests';

async function run(): Promise<void> {
  const { prBody, anthropicApiKey: apiKey, githubToken, prNumber, repoOwner, repoName } = config;

  if (!prBody) {
    console.log('No PR description found. Proceeding without context.');
    core.setOutput('brief', '');
    return;
  }

  // Extract test definitions from the PR diff if any exist
  let testContexts: Awaited<ReturnType<typeof extractTestContext>> = [];
  try {
    testContexts = await extractTestContext(githubToken, repoOwner, repoName, prNumber);
    if (testContexts.length > 0) {
      console.log(`Found tests in ${testContexts.length} file(s), adding to context.`);
    }
  } catch (err) {
    console.warn('Could not extract test context:', (err as Error).message);
  }

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

  console.log('Brief generated:\n', block.text);
  core.setOutput('brief', block.text);
}

run().catch((err: Error) => {
  // Never block the review over a failed summarization
  console.error('Context extraction failed:', err.message);
  core.setOutput('brief', '');
});
