export const config = {
  // Your Anthropic API key — get one at https://console.anthropic.com
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',

  // Auto-provided by GitHub Actions — no setup needed
  githubToken: process.env.GITHUB_TOKEN ?? '',

  // Pulled from the PR event automatically — no setup needed
  prBody: process.env.PR_BODY?.trim() ?? '',
  prNumber: parseInt(process.env.PR_NUMBER ?? '0', 10),
  repoOwner: process.env.REPO_OWNER ?? '',
  repoName: process.env.REPO_NAME ?? '',
} as const;
