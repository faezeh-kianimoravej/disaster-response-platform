# DRCCS Release Process

This document describes how to create a new release of the Disaster Response Coordination and Communication System (DRCCS).

## Prerequisites

- Commit access to the main branch
- Docker Hub credentials configured in GitLab CI/CD variables:
  - `DOCKERHUB_USERNAME`
  - `DOCKERHUB_TOKEN`

## Release Workflow

### 1. Update the VERSION File

Edit the `VERSION` file at the repository root with the desired version number:

```bash
# For release candidates
echo "1.0.0-rc1" > VERSION

# For stable releases
echo "1.0.0" > VERSION
```

**Version Format:**
- Release candidates: `X.Y.Z-rcN` (e.g., `1.0.0-rc1`)
- Stable releases: `X.Y.Z` (e.g., `1.0.0`)

**Note:** Do NOT include the `v` prefix in the VERSION file. The `v` is added automatically when creating the Git tag.

### 2. Commit and Push to Main

```bash
git add VERSION
git commit -m "chore: bump version to $(cat VERSION)"
git push origin main
```

### 3. Create and Push the Git Tag

Create an annotated tag matching the VERSION file with a `v` prefix:

```bash
git tag -a "v$(Get-Content VERSION)" -m "Release v$(Get-Content VERSION)"
```

**Important:** The tag MUST match `v$(cat VERSION)` exactly, or the pipeline will fail validation.

### 4. Monitor the Pipeline

Once you push the tag, GitLab CI will automatically:

1. **Validate** that the Git tag matches the VERSION file
2. **Run tests** for backend and frontend
3. **Build Docker images** for all services:
   - All 9 backend microservices
   - Frontend React application
4. **Tag images**:
   - Always tagged with the version (e.g., `1.0.0-rc1`)
   - `latest` tag added ONLY for stable releases (NOT for `-rc*` tags)
5. **Push to Docker Hub** under `disaster-response-*` image names
6. **Security scan** images with Trivy (non-blocking)

Visit the GitLab CI/CD Pipelines page to monitor progress:
- `https://gitlab.com/<your-org>/<your-repo>/-/pipelines`

### 5. Verify Release

After the pipeline succeeds, verify images are available on Docker Hub:

```bash
# Check a sample service
docker pull fkiani/disaster-response-api-gateway:1.0.0

# Verify frontend
docker pull fkiani/disaster-response-frontend:1.0.0
```

For release candidates, verify `latest` was NOT created:
```bash
# This should fail for RC tags
docker pull fkiani/disaster-response-api-gateway:latest
```

### 6. Deploy the Release (Operator Documentation)

Deployment instructions for users/operators live in `release/README.md`. Developers creating releases do not need to perform deployment as part of the release pipeline itself.

If you need to verify manually:
```bash
cd release
docker-compose pull
docker-compose up -d
```

## Version Bump Strategy

### Major Version (X.0.0)
Breaking changes, major architecture updates, incompatible API changes.

### Minor Version (X.Y.0)
New features, backward-compatible functionality additions.

### Patch Version (X.Y.Z)
Bug fixes, security patches, minor improvements.

### Release Candidates (X.Y.Z-rcN)
Pre-release testing versions. Automatically skips `latest` tag to prevent accidental production use.

## Rollback

If you need to rollback a release:

1. **Revert the VERSION file** to the previous version
2. **Create a new tag** with the reverted version
3. The pipeline will rebuild and republish the previous version

Alternatively, redeploy containers using a previous image tag directly (see `release/README.md`).

## Troubleshooting

### Pipeline Fails: "Tag mismatch"

**Error:** `Git tag 'vX.Y.Z' does not match VERSION file 'vA.B.C'`

**Solution:** Ensure the Git tag exactly matches `v` + VERSION file contents:
```bash
cat VERSION  # Should output X.Y.Z (no v prefix)
git tag      # Should show vX.Y.Z
```

Delete incorrect tag and recreate:
```bash
git tag -d v1.0.0-wrong
git push origin :refs/tags/v1.0.0-wrong
```

### Docker Build Fails

**Common causes:**
- Maven dependency resolution issues → Check internet connectivity in runner
- Multi-stage build OOM → Increase Docker runner resources

**Local test:**
```bash
cd backend-app/api-gateway
docker build -t test-api-gateway .
```

### Images Not Appearing on Docker Hub

**Check:**
1. GitLab CI variables `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` are set
2. Token has push permissions
3. Pipeline logs show successful `docker push` commands

## Release Checklist

Before creating a release tag:

- [ ] All tests pass on `main` branch
- [ ] VERSION file updated
- [ ] Changelog updated (if applicable)
- [ ] Migration scripts tested (if database changes)
- [ ] Release notes drafted
- [ ] Team notified of upcoming release

After release:

- [ ] Pipeline completed successfully
- [ ] Images verified on Docker Hub
- [ ] Test deployment in staging environment
- [ ] Production deployment completed
- [ ] Release announcement sent
- [ ] Post-release monitoring for 24 hours

## Support

For questions or issues with the release process:
- Open an issue in the repository
- Contact the project coordinator (see `Docs/Team-Charter.md`)
