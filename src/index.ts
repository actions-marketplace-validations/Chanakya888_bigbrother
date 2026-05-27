import Anthropic from '@anthropic-ai/sdk';
import * as core from '@actions/core';

const PROMPT = (prBody: string): string => `
You are preparing a brief for a code reviewer.
Read this PR description and extract a concise review brief.

PR Description:
${prBody}

Output:
1. What is being built or changed (1-2 sentences)
2. Expected behavior or requirements
3. Edge cases or gotchas mentioned

Keep it under 150 words. Be direct and specific.
`.trim();

async function run(): Promise<void> {
  const prBody = process.env.PR_BODY?.trim() ?? '';
  const apiKey = process.env.ANTHROPIC_API_KEY ?? '';

  if (!prBody) {
    console.log('No PR description found. Proceeding without context.');
    core.setOutput('brief', '');
    return;
  }

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: PROMPT(prBody),
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
