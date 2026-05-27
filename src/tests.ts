export interface TestContext {
  file: string;
  tests: string[];
}

interface GitHubFile {
  filename: string;
  patch?: string;
}

function extractTestNames(lines: string[]): string[] {
  const tests: string[] = [];
  const pattern = /(?:describe|it|test)\s*\(\s*['"`](.+?)['"`]/g;

  for (const line of lines) {
    let match;
    while ((match = pattern.exec(line)) !== null) {
      tests.push(match[1]);
    }
  }

  return [...new Set(tests)];
}

export async function extractTestContext(
  token: string,
  owner: string,
  repo: string,
  prNumber: number
): Promise<TestContext[]> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/files`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  const files = (await response.json()) as GitHubFile[];

  const testFiles = files.filter(
    f =>
      /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(f.filename) ||
      f.filename.includes('__tests__')
  );

  if (testFiles.length === 0) return [];

  const contexts: TestContext[] = [];

  for (const file of testFiles) {
    if (!file.patch) continue;

    const addedLines = file.patch
      .split('\n')
      .filter(line => line.startsWith('+'))
      .map(line => line.slice(1));

    const tests = extractTestNames(addedLines);

    if (tests.length > 0) {
      contexts.push({ file: file.filename, tests });
    }
  }

  return contexts;
}
