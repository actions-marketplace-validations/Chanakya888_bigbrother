interface TestContext {
  file: string;
  tests: string[];
}

function buildTestSection(testContexts: TestContext[]): string {
  if (testContexts.length === 0) return '';

  const lines = testContexts.flatMap(ctx => [
    `  File: ${ctx.file}`,
    ...ctx.tests.map(t => `    - ${t}`),
  ]);

  return `
<tests>
The developer wrote the following tests. Use these to understand intended behaviour and what edge cases they were thinking about:
${lines.join('\n')}
</tests>
`;
}

export const buildPrompt = (prBody: string, testContexts: TestContext[] = []): string => `
You are a senior software engineer writing a pre-review brief for a code reviewer.

<pr_description>
${prBody}
</pr_description>
${buildTestSection(testContexts)}
Write a structured review brief using the exact markdown headers below.
Each section must be tight and specific to this PR — no padding, no generic advice.
Do NOT write things like "write tests", "handle errors", "follow best practices", or anything that applies to every PR.
If a section has nothing specific to say, write a single dash: -

## What's being built
One sentence. State the intent and user-facing impact, not the technology used.

## Must get right
3 bullets max. The technical requirements that MUST be correct for this feature to work — think state management, data flow, API contracts, persistence, concurrency. Specific to this feature only.

## Architecture
2–3 bullets. Now that you know what the feature is trying to do — is the chosen approach the right one? Is the structure, data flow, or component design well-suited to this problem, or are there simpler/more robust patterns that would serve it better? Flag any architectural choices that will cause pain as the feature grows.

## Common pitfalls
3 bullets max. What developers typically get wrong when building exactly this kind of feature. Name the specific bug or oversight, not the category.

## Edge cases to probe
3–5 bullets. Specific inputs, states, or failure modes a reviewer should hunt for in the code.${testContexts.length > 0 ? ' Flag any obvious edge cases missing from the tests.' : ''}

## Red flags
2–3 bullets. Patterns or shortcuts that should immediately raise concern in a PR like this.

Total brief: under 300 words. Write like a sharp senior engineer handing off to a peer, not a checklist generator.
`.trim();
