# GitLab CI/CD for Client-App Testing

This document explains the automated testing process set up for the `client-app` React/Vite application.

## Overview

The GitLab CI/CD pipeline automatically runs tests for the `client-app` whenever changes are made to the `client-app/` folder. This ensures code quality and prevents regressions.

## When Tests Run

### Main Branch
- **Trigger**: Changes to any file in the `client-app/` directory on the `main` branch
- **Actions**: Full test suite including:
  - ESLint code linting
  - Vitest unit tests with coverage reporting
  - Prettier code formatting checks
  - Coverage artifacts collection

### Feature Branches
- **Trigger**: Changes to any file in the `client-app/` directory on feature branches
- **Actions**: Lightweight testing including:
  - ESLint code linting
  - Vitest unit tests (without coverage)
  - Prettier code formatting checks

### Merge Requests
- **Trigger**: Merge requests targeting the `main` branch with changes to `client-app/`
- **Actions**: Same as main branch (full test suite with coverage)

## Pipeline Configuration

The pipeline is defined in `.gitlab-ci.yml` and includes:

- **Node.js Environment**: Uses Node.js 20
- **Caching**: Caches `node_modules` for faster builds
- **Coverage Reporting**: Generates coverage reports in multiple formats
- **Artifacts**: Stores test coverage reports for 30 days

## Test Commands

The following npm scripts are executed during the pipeline:

```bash
npm run lint          # ESLint code quality checks
npm run coverage      # Run tests with coverage reporting
npm run format:check  # Prettier formatting validation
```

## Coverage Reporting

- Coverage reports are generated in multiple formats (text, JSON, HTML, Cobertura)
- GitLab displays coverage percentage in merge requests
- Coverage artifacts are available for download for 30 days
- Coverage threshold can be configured in the pipeline

## Local Testing

Before pushing changes, you can run the same tests locally:

```bash
cd client-app

# Install dependencies
npm install

# Run linting
npm run lint

# Run tests with coverage
npm run coverage

# Check formatting
npm run format:check

# Fix formatting issues
npm run format

# Fix linting issues
npm run lint:fix
```

## Troubleshooting

### Common Issues

1. **Linting Failures**: Run `npm run lint:fix` to automatically fix common issues
2. **Formatting Failures**: Run `npm run format` to fix formatting
3. **Test Failures**: Check test output and fix failing tests
4. **Cache Issues**: GitLab may need cache clearing if dependencies are updated

### Pipeline Not Triggering

Ensure your changes include files in the `client-app/` directory. The pipeline only runs when:
- Files in `client-app/` are modified
- The branch is `main` or a merge request targets `main`

## Extending the Pipeline

To add more checks or modify the pipeline:

1. Edit `.gitlab-ci.yml`
2. Modify the `script` section for additional commands
3. Update `rules` section to change trigger conditions
4. Add new jobs for different types of testing

## Dependencies

The pipeline requires these key packages (already configured):
- `vitest` - Testing framework
- `@vitest/coverage-v8` - Coverage reporting
- `eslint` - Code linting
- `prettier` - Code formatting