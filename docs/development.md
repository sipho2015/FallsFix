# Development environment and Git workflow

Phase 1 establishes the local repository and tooling baseline. No application, package manifest, dependencies, database, or npm scripts exist yet.

## Verified local tools

The following commands ran successfully on the Windows PowerShell development machine during Phase 1:

| Command | Observed version |
| --- | --- |
| `git --version` | `2.55.0.windows.5` |
| `node --version` | `v24.16.0` |
| `npm --version` | `11.13.0` |

Git records version history. Node.js will execute the JavaScript development/server tools. npm will install project dependencies and run defined project scripts starting in Phase 2.

`.node-version` records the observed Node version for version managers that support this file; it does not install or switch Node by itself. No version manager is required. Framework compatibility and current security releases must be checked when choosing dependencies in Phase 2. These observed versions are not a claim that a future application has been tested against them.

## Open and inspect the repository

On the original development machine:

```powershell
Set-Location C:\Source\repos\FallsFix
git status
git log --oneline
node --version
npm --version
```

There is no GitHub remote yet. After a remote is deliberately created, document its actual clone URL here. Do not run `npm install`, migrations, or a development server now: there is no package manifest or application.

No environment variables are needed in this phase. Add a reviewed `.env.example` with placeholders when configuration is introduced, not invented credentials ahead of implementation. PostgreSQL and storage setup belong to their later phases.

## Repository conventions

- `main` holds the reviewed baseline. Use short-lived descriptive branches, for example `feature/nextjs-foundation`, `feature/customer-authentication`, or `docs/business-rules`.
- A branch is an independent line of development; a commit is a named snapshot. Small commits make changes easier to review and correct.
- Commit messages describe intent, such as `chore: establish development environment`, `feat: add service request form`, or `test: reject unauthorized job updates`.
- Introduce `develop` only if a release process needs a separate integration branch.
- Update README and affected documentation in the same change as the behavior or setup they describe.

Example workflow after the initial baseline exists:

```powershell
git switch -c feature/nextjs-foundation
git status --short
git diff
```

After implementing and checking a change, stage specific intended files with `git add`, inspect `git diff --cached`, and commit with a descriptive message. Run `git diff --cached --check` before committing to catch whitespace errors. When a remote exists, use pull requests for review and add required automated checks once code exists.

This setup uses the developer's existing Git author configuration without changing global settings. Before publishing, inspect the author identity with `git log -1 --format=fuller`; commit metadata contains the configured author name and email. Select a suitable identity before future commits if desired.

## File and secret hygiene

`.editorconfig` requests UTF-8 text, two-space indentation, final newlines, and LF line endings in supporting editors. `.gitattributes` normalizes tracked text line endings across operating systems. These files improve consistency but do not replace a formatter or linter; choose those alongside the application in Phase 2.

`.gitignore` excludes environment files, private-key file types, local npm configuration, dependencies, generated output, logs, and machine-specific editor/deployment metadata. `.env.example` remains trackable so safe configuration instructions can be shared. Review it before every commit: an exception does not make its contents safe.

Ignore rules are not a secret scanner and cannot untrack a file already committed. Review staged changes. If a secret is ever exposed, revoke/rotate it and address repository history as needed; simply adding its filename to `.gitignore` is insufficient.

Inspect the relevant rules without creating secret files:

```powershell
git check-ignore -v --no-index .env .env.local node_modules/example.js .next/cache/example
git status --short
git diff --cached --check
```

## Phase 1 validation

- Verify Git, Node, and npm execute and record their observed versions.
- Verify the repository is on `main` and has no accidental remote.
- Verify environment/private-key/dependency/build paths are ignored, including nested environment files.
- Verify `.env.example`, source paths, documentation, and future `package-lock.json` remain trackable.
- Verify documentation links, staged whitespace, committed file list, and clean final working tree.

There is no code to lint, type-check, unit-test, or build. Those checks begin with Phase 2. No GitHub repository, branch protection, CI service, or deployment has been configured.

## Next phase

Phase 2 creates the minimal Next.js application, strict TypeScript configuration, styling foundation, lint/type-check/build scripts, and a package lockfile. Explain and verify the chosen versions then. Do not build the public website or portals during that foundation phase.
