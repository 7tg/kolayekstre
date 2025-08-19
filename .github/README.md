# GitHub Actions CI/CD Configuration

This directory contains GitHub Actions workflows for automated testing, quality assurance, and deployment.

## Workflows

### 🔄 CI (`ci.yml`)
**Triggers:** Push to `main`/`develop`, Pull requests to `main`

**Actions:**
- Runs on Node.js 18.x and 20.x
- TypeScript type checking
- Test execution with Vitest
- Production build generation
- Artifact upload for builds

### 🔍 Code Quality (`code-quality.yml`)
**Triggers:** Push to `main`/`develop`, Pull requests to `main`

**Actions:**
- ESLint code linting
- Prettier formatting checks
- Security audit with `npm audit`
- Vulnerability scanning

### 🚀 Deploy (`deploy.yml`)
**Triggers:** Push to `main`, Version tags (`v*`)

**Actions:**
- Production builds for releases
- Artifact storage (90 days for releases)
- Automated GitHub releases for tags
- Ready for deployment integration

### 🤖 Dependabot (`dependabot.yml`)
**Schedule:** Weekly on Mondays at 9:00 AM

**Actions:**
- Automatic dependency updates
- GitHub Actions version updates
- Automated pull requests with proper commit messages

## Branch Protection Recommendations

For production use, consider setting up branch protection rules:

```
Branch: main
- Require pull request reviews
- Require status checks to pass before merging:
  - CI / test (Node.js 18.x)
  - CI / test (Node.js 20.x)  
  - Code Quality / lint
  - Code Quality / security
- Require branches to be up to date
- Restrict pushes to matching branches
```

## Secrets Configuration

No secrets are currently required, but for future deployment:

- `GITHUB_TOKEN` - Automatically provided by GitHub
- Add deployment-specific secrets as needed

## Status Badges

Add to your main README.md:

```markdown
![CI](https://github.com/YOUR_USERNAME/kolayekstre/workflows/CI/badge.svg)
![Code Quality](https://github.com/YOUR_USERNAME/kolayekstre/workflows/Code%20Quality/badge.svg)
```