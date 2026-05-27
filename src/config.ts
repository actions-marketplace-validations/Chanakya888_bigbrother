export const config = {
  // Your Anthropic API key — get one at https://console.anthropic.com
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',

  // Auto-provided by GitHub Actions — no setup needed
  githubToken: process.env.GITHUB_TOKEN ?? '',

  // Pulled from the PR event automatically — no setup needed
  prBody: process.env.PR_BODY?.trim() ?? '',
} as const;
