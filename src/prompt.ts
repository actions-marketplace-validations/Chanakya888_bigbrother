interface TestContext {
  file: string;
  tests: string[];
}

function buildTestSection(testContexts: TestContext[]): string {
  if (testContexts.length === 0) return '';

  const lines = testContexts.flatMap(ctx => [
    `File: ${ctx.file}`,
    ...ctx.tests.map(t => `  - ${t}`),
  ]);

  return `
**Tests found in this PR**
The developer wrote the following tests. Use these to understand what behaviour
they intended to cover and what edge cases they were thinking about:
${lines.join('\n')}
`;
}

export const buildPrompt = (prBody: string, testContexts: TestContext[] = []): string => `
You are a senior software engineer preparing a briefing for a code reviewer.

You have been given a PR description. Your job is NOT just to summarise it.
Your job is to use your engineering knowledge to figure out what this type of feature
typically involves, what must be checked, and what developers commonly get wrong.

PR Description:
---
${prBody}
---
${buildTestSection(testContexts)}
Produce a structured review brief with the following sections:

**What's being built**
1-2 sentences. What is the intent of this change?

**What this feature must get right**
Based on your knowledge of this type of feature — not just what the description says —
what are the technical requirements that must be correct for this to work properly?
Think about state management, data flow, API contracts, persistence, concurrency, etc.
as they apply to this specific feature type.

**Common pitfalls for this type of change**
What do developers typically get wrong when building something like this?
What subtle bugs, race conditions, or oversights are common in this domain?
Be specific to the feature — not generic advice.

**Edge cases to probe**
List the specific edge cases a reviewer should hunt for in the code.
Think about empty states, boundary values, failure modes, and unexpected inputs
that are typical for this kind of feature.
${testContexts.length > 0 ? `Also cross-check: are there obvious edge cases missing from the tests written?` : ''}

**Red flags to watch for**
What patterns or shortcuts in the code should immediately raise concern?

Keep the entire brief under 300 words. Be sharp and specific — not generic.
A reviewer should be able to read this and know exactly what to look for.
`.trim();
