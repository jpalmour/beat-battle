# Branch Push Troubleshooting

This guide summarizes steps to diagnose errors when updating or creating pull requests, especially HTTP 500 errors during branch operations.

## Likely Causes
- Temporary service outages on the Git host (HTTP 500 usually indicates a server-side issue).
- Network/connectivity interruptions when pushing.
- Local branch desync (e.g., force pushes required by protected branches or missing upstream).
- Authentication/token expiration.

## How to Check Branch Health Locally
1. Confirm the branch is checked out and has an upstream:
   ```bash
   git status -sb
   git rev-parse --abbrev-ref --symbolic-full-name @{u}
   ```
2. Verify there are no merge conflicts or incomplete rebases:
   ```bash
   git rebase --show-current-patch
   git reflog --date=iso | head
   ```
3. Run a dry push to see the exact error response:
   ```bash
   GIT_TRACE_PACKET=1 GIT_TRACE=1 git push --dry-run
   ```

## Preserving Work if the Remote Is Failing
- Create a safety branch locally and push later:
  ```bash
  git checkout -b backup/\$(date +%Y%m%d-%H%M)
  git push -u origin backup/<timestamp>
  ```
- Create a local patch as a fallback:
  ```bash
  git diff > backup.patch
  ```

## When HTTP 500 Persists
- Wait and retry; server-side incidents often resolve quickly.
- Try pushing a new branch name (the remote may have a transient lock on the original).
- Check the provider's status page for ongoing incidents.
- If the upstream branch was deleted or is protected, recreate it from your local HEAD using a new name and open a fresh PR.

## Signals to Investigate Further
- Repeated authentication prompts despite valid credentials.
- Errors mentioning permissions, branch protection, or repository moved/renamed.
- Divergent histories requiring `--force-with-lease` (coordinate with collaborators before forcing).
