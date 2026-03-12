# GitHub Actions Workflows

This directory contains CI/CD workflows for the Pokayoke API project.

## Workflows Overview

### 1. **Development Workflow** (`development.yml`)
- **Trigger**: Push to `development` branch or PR to `development`
- **Runner**: `ubuntu-latest` (GitHub-hosted)
- **Purpose**: Deploy to development/staging environment

### 2. **Production Workflow** (`production.yml`)
- **Trigger**: Merged PR to `main` branch or direct push to `main`
- **Runner**: `[self-hosted, linux, x64]` (Self-hosted runner)
- **Purpose**: Deploy to production environment

## Production Workflow Details

### Triggers

The production workflow runs when:
1. **Pull Request to `main` is closed and merged** ✅
   - Only executes if `github.event.pull_request.merged == true`
   - Skips if PR is closed without merging

2. **Direct push to `main` branch** ✅
   - For emergency hotfixes or direct commits

### Runner Configuration

```yaml
runs-on: [self-hosted, linux, x64]
```

This requires:
- Self-hosted runner with labels: `self-hosted`, `linux`, `x64`
- Runner must be configured in your GitHub repository settings

### Deployment Steps

1. **Checkout code** 📥
   - Clones the main branch
   - Uses `actions/checkout@v4`

2. **Verify merge** ✅
   - Only runs on PR events
   - Displays PR number and commit SHA

3. **Setup Bun** 🐰
   - Installs latest Bun runtime
   - Uses `oven-sh/setup-bun@v1`

4. **Install dependencies** 📦
   - Runs `bun install --frozen-lockfile`
   - Ensures reproducible builds

5. **Run tests** 🧪
   - Placeholder for test commands
   - Uncomment and add your test script: `bun test`

6. **Build application** 🔨
   - Runs `bun run build`
   - Creates production build

7. **Generate migrations** 🗄️
   - Runs `bun run db:generate`
   - Generates Drizzle ORM migrations

8. **Deploy to production** 🚀
   - Stops existing containers: `docker compose down`
   - Builds and starts new containers: `docker compose up -d --build`

9. **Health check** 🏥
   - Waits 10 seconds for application startup
   - Runs `bun run health-check`
   - Verifies application is responding

10. **Notifications** 📢
    - Success notification with deployment details
    - Failure notification with error information

## Setting Up Self-Hosted Runner

### Prerequisites

- Linux x64 machine (Ubuntu/Debian recommended)
- Docker installed
- Sufficient resources (min: 2 CPU, 4GB RAM)

### Installation Steps

1. **Navigate to repository Settings**
   ```
   Repository → Settings → Actions → Runners → New self-hosted runner
   ```

2. **Download and configure runner**
   ```bash
   # Create actions runner directory
   mkdir actions-runner && cd actions-runner

   # Download the latest runner package
   curl -o actions-runner-linux-x64-<version>.tar.gz -L \
     https://github.com/actions/runner/releases/download/v<version>/actions-runner-linux-x64-<version>.tar.gz

   # Extract the installer
   tar xzf ./actions-runner-linux-x64-<version>.tar.gz

   # Configure the runner
   ./config.sh --url https://github.com/<org>/<repo> --token <token>
   ```

3. **Add labels to runner**
   During configuration, add these labels:
   - `self-hosted`
   - `linux`
   - `x64`

4. **Install and start service**
   ```bash
   # Install as a service
   ./svc.sh install

   # Start the service
   ./svc.sh start
   ```

5. **Verify runner is active**
   - Check GitHub repository Settings → Actions → Runners
   - Runner should show as "Idle" or "Running"

## Environment Variables

Required secrets in GitHub repository settings:

```
Settings → Secrets and variables → Actions → New repository secret
```

Currently, the workflow uses environment variables from `docker-compose.yml`. If you need additional secrets:

1. **SSH Deployment** (if needed):
   - `SSH_PRIVATE_KEY`: SSH private key for server access
   - `SERVER_HOST`: Production server hostname/IP
   - `SERVER_USER`: SSH username
   - `SERVER_PATH`: Application path on server

2. **Application Secrets** (already in .env):
   - `DATABASE_URL`: Production database connection string
   - `JWT_SECRET`: JWT signing secret
   - `JWT_REFRESH_SECRET`: JWT refresh token secret
   - SMTP configuration variables

## Monitoring Deployments

### View Workflow Runs

1. Navigate to: **Repository → Actions**
2. Filter by workflow: "CI/CD Production"
3. Click on a run to view details

### Workflow Logs

Each step shows:
- ✅ Green checkmark for success
- ❌ Red X for failure
- ⚪ Yellow circle for in-progress

### Deployment Notifications

The workflow outputs detailed logs:

**Success:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ PRODUCTION DEPLOYMENT SUCCESSFUL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Commit: abc123...
👤 Author: username
⏰ Time: 2026-02-07 10:30:45 UTC
🌐 Environment: Production
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Failure:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ PRODUCTION DEPLOYMENT FAILED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Commit: abc123...
👤 Author: username
⏰ Time: 2026-02-07 10:30:45 UTC
🌐 Environment: Production
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Common Issues & Troubleshooting

### Issue: Runner not found
**Solution:**
1. Verify self-hosted runner is active
2. Check runner labels: `self-hosted`, `linux`, `x64`
3. Ensure runner is online (not offline)

### Issue: Docker compose fails
**Solution:**
1. SSH into the runner machine
2. Check Docker is running: `docker ps`
3. Check logs: `docker compose -f docker-compose.yml logs`

### Issue: Health check fails
**Solution:**
1. Check application logs: `docker compose logs api`
2. Verify environment variables
3. Check database connectivity

### Issue: Workflow doesn't trigger
**Solution:**
1. Verify branch name is `main`
2. For PRs, ensure it's merged (not just closed)
3. Check workflow file syntax is valid

## Testing Locally

Before deploying, you can simulate the workflow:

```bash
# 1. Build application
bun run build

# 2. Generate migrations
bun run db:generate

# 3. Deploy locally
docker compose -f docker-compose.yml down
docker compose -f docker-compose.yml up -d --build

# 4. Health check
sleep 10
bun run health-check
```

## Best Practices

1. **Always use Pull Requests**
   - Create PR from development → main
   - Review changes before merging
   - Workflow auto-deploys on merge

2. **Test before merging**
   - Ensure tests pass locally
   - Test in development environment first

3. **Monitor deployments**
   - Watch Actions tab for deployment status
   - Check logs if deployment fails

4. **Rollback plan**
   - Keep previous Docker images
   - Use git revert if needed
   - Restore from database backup if schema changes

## Security Considerations

- ✅ Runner is self-hosted (doesn't expose secrets to GitHub)
- ✅ Secrets stored in GitHub encrypted storage
- ✅ Workflow only triggers on merged PRs
- ⚠️ Ensure runner machine is secure
- ⚠️ Regularly rotate secrets
- ⚠️ Use least privilege for service accounts

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Self-Hosted Runners](https://docs.github.com/en/actions/hosting-your-own-runners)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Bun Documentation](https://bun.sh/docs)
