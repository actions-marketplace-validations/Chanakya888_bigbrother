# Big Brother Sees 👁️

Big Brother sees what you're building, not just what changed.

Most AI code reviewers only see the diff. They'll catch null checks and syntax issues but have no idea what you're actually building. Big Brother Sees reads your PR description first, summarizes it with Claude, and passes that context to PR-Agent so your review is about whether your code actually solves the problem, not just whether it compiles.

## Setup

**1. Add your Anthropic API key to your repo secrets**

Go to `Settings > Secrets > Actions` and add:
- `ANTHROPIC_API_KEY` get one at [console.anthropic.com](https://console.anthropic.com)

**2. Create `.github/workflows/bigbrother.yml` in your repo**

```yaml
name: Big Brother Sees

on:
  pull_request:
    types: [opened, synchronize, reopened]

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

**3. Write a proper PR description**

The more context you give, the smarter the review. Tell it what you're building, what the expected behavior is, and any edge cases you're aware of. No description means no context means a generic review.

## Built on top of

Big Brother Sees uses [PR-Agent](https://github.com/The-PR-Agent/pr-agent) under the hood for the actual code review. We just handle the context layer on top of it.

## How it works

1. PR is opened or updated
2. Big Brother Sees reads the PR description
3. Claude summarizes it into a focused review brief
4. PR-Agent reviews the code using that brief as context
5. You get a review that actually understands what you're trying to do
