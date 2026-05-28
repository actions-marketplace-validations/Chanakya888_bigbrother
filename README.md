# Big brother intel 👁️

Big Brother sees what you're building, not just what changed.

Most AI code reviewers only see the diff. They'll catch null checks and syntax issues but have no idea what you're actually building. Big brother intel reads your PR description first, summarizes it with Claude, and passes that context to PR-Agent — so your review is about whether your code actually solves the problem, not just whether it compiles.

## Setup

Two easy steps:

**1. Add this file to your repo at `.github/workflows/bigbrother.yml`**

```yaml
name: Big brother intel

on:
  pull_request:
    types: [opened, reopened]

jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: Chanakya888/bigbrother@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
```

**2. Add your Anthropic API key as `ANTHROPIC_API_KEY` in `Settings → Secrets → Actions`**

Get one at [console.anthropic.com](https://console.anthropic.com).

## How it works

1. PR is opened — Big brother intel reads the description
2. Claude generates a focused review brief — what's being built, whether the architecture is right for the feature, pitfalls, edge cases, red flags
3. The brief is posted as a comment on the PR so you can see what context was surfaced
4. PR-Agent reviews the code using that brief as extra context
5. You get a review that actually understands what you're trying to do

## Built on top of

Big brother intel uses [PR-Agent](https://github.com/The-PR-Agent/pr-agent) under the hood for the actual code review. We handle the context layer on top.
