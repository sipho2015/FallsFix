# Development environment and Git workflow

Phase 1 established the repository/tooling baseline. Phase 2 added the Next.js foundation, Phase 3 added public pages/HTTP smoke tests, and Phase 4 adds PostgreSQL/Prisma and integration tests. See [database setup](database.md).

## Verified local tools

The following commands ran successfully on the Windows PowerShell development machine during Phase 1:

| Command | Observed version |
| --- | --- |
| `git --version` | `2.55.0.windows.5` |
| `node --version` | `v24.16.0` |
| `npm --version` | `11.13.0` |

Git records version history. Node.js executes the JavaScript development/server tools. npm installs dependencies and runs the scripts in `package.json`.

`.node-version` records the observed Node version for version managers that support this file; it does not install or switch Node by itself. No version manager is required. Phase 2 checks package compatibility and records exact dependencies in package.json and package-lock.json. Recheck compatibility and security advisories when updating them.

## Open and inspect the repository

On the original development machine:

```powershell
Set-Location C:\Source\repos\FallsFix
git status
git log --oneline
node --version
npm --version
```

There is no GitHub remote yet. After a remote is deliberately created, document its actual clone URL here. Run `npm ci` then `npm run dev` from the repository directory and open http://127.0.0.1:3000. Stop with Ctrl+C before building. Use `npm run dev -- --port 3001` if necessary.

The public website runs without environment values. Database commands require the variables in `.env.example`; follow [database setup](database.md) to generate local credentials or configure an existing server. Storage remains a later phase. Do not print or commit actual connection URLs.

## Repository conventions

- `main` holds the reviewed baseline. Use short-lived descriptive branches, for example `feature/nextjs-foundation`, `feature/customer-authentication`, or `docs/business-rules`.
- A branch is an independent line of development; a commit is a named snapshot. Small commits make changes easier to review and correct.
- Commit messages describe intent, such as `chore: establish development environment`, `feat: add service request form`, or `test: reject unauthorized job updates`.
- Introduce `develop` only if a release process needs a separate integration branch.
- Update README and affected documentation in the same change as the behavior or setup they describe.

Example workflow for a subsequent feature (choose a new branch name):

```powershell
git switch -c feature/public-website
git status --short
git diff
```

After implementing and checking a change, stage specific intended files with `git add`, inspect `git diff --cached`, and commit with a descriptive message. Run `git diff --cached --check` before committing to catch whitespace errors. When a remote exists, use pull requests for review and add required automated checks once code exists.

This setup uses the developer's existing Git author configuration without changing global settings. Before publishing, inspect the author identity with `git log -1 --format=fuller`; commit metadata contains the configured author name and email. Select a suitable identity before future commits if desired.

## File and secret hygiene

`.editorconfig` requests UTF-8 text, two-space indentation, final newlines, and LF line endings in supporting editors. `.gitattributes` normalizes tracked text line endings across operating systems. These files improve consistency but do not replace a formatter or linter; Phase 2 introduces ESLint with Next.js and TypeScript rules.

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

Run `npm run check` for ESLint and strict TypeScript, then `npm run build` for a production build and `npm start` to serve it locally. Type checking generates route types before checking, including on a fresh checkout. Do not run dev and production builds concurrently in the same directory. Stop servers before `npm ci`, which replaces dependency files. Phase 3 adds `npm run test:smoke` against a running server on port 3100; see [the public-site test instructions](public-website.md#verification). No domain unit or browser end-to-end suite exists yet. No GitHub repository, branch protection, CI service, or deployment has been configured.

## Phase 2 verification

- `npm ci --no-fund`: successfully reinstalled the locked dependency tree and reported zero known vulnerabilities.
- `npm run dev -- --port 3101`: started successfully; HTTP homepage check passed after the lockfile reinstall.
- `npm run check`: passed ESLint with zero warnings and strict TypeScript checking, including route-type generation before the first build.
- `npm run build`: passed; homepage and not-found output prerendered successfully.
- `npm start -- --port 3100`: production server started successfully on loopback.
- HTTP checks passed for homepage 200, custom unknown-route 404, page content, linked generated Tailwind CSS, skip-link target, noindex metadata, security headers, and absence of `X-Powered-By`.
- npm installation audit reported zero known vulnerabilities in the installed tree; dependency support limitations below still apply.
- Documentation links, ignore rules, and whitespace were checked.
- Browser connection returned no available browser. Responsive visual inspection, keyboard interactions, and client-side navigation have **not** been verified; carry these checks into Phase 3 when a browser is available. HTTP checks do not substitute for browser testing.

Next.js generates `AGENTS.md` and `CLAUDE.md` on development startup. They are tracked to retain the framework's version-specific guidance rather than leaving recurring untracked files. `next-env.d.ts` and `.next` are generated local build/type artifacts and remain ignored.

## Dependency maintenance note

Phase 4 pins Prisma ORM/client/adapter 7.10.0. Its development tooling originally brought vulnerable `deepmerge-ts` and `mysql2` versions. Scoped overrides select `deepmerge-ts` 8.0.2 under `@prisma/config` and `mysql2` 3.24.4 under `prisma`. The deepmerge major release changes Map merging, but this project's Prisma configuration uses plain records; configuration, generation, migrations, and tests were checked with the patched version. FallsFix uses PostgreSQL, not the bundled MySQL tooling. Revisit the overrides when upgrading Prisma; do not remove them without auditing and testing the resulting tree.

The patched installation reports zero known vulnerabilities. References: [DeepmergeTS 8 release/security changes](https://github.com/RebeccaStevens/deepmerge-ts/releases/tag/v8.0.0), [MySQL2 advisory](https://github.com/advisories/GHSA-rgwj-5xj2-c3m3).

The Phase 2 dependency tree uses Next.js 16.3.6, React 19.3.0, TypeScript 5.9.3, and Tailwind 4.3.3. ESLint 9.39.5 installs with an upstream end-of-support warning. The React lint plugin used by `eslint-config-next` declares compatibility through ESLint 9, not ESLint 10, so this foundation does not force an incompatible major upgrade. Track upstream plugin compatibility and upgrade the lint toolchain together. This development-tool support limitation remains open; a zero-vulnerability npm audit is not a support guarantee.

## Next phase

### Dependency review (2026-10-10)

Next.js and its ESLint configuration are now pinned to 16.3.8, and the lockfile selects source-map-js 1.2.2. These resolve the newly reported production dependency advisories. The full audit still reports five high-severity entries from one unpatched development dependency chain: eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces 3.0.3. [The braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) lists no patched release. Lint processes repository paths/patterns rather than customer input; track the upstream fix and re-audit before release. Do not downgrade the Next.js lint configuration to an incompatible major or force an audit fix to hide this outstanding finding.

Interactive browser/operator acceptance is recorded in [the acceptance checklist](acceptance.md). Current implementation and verification supersede the historical phase descriptions below; see [progress](progress.md).

Phase 6 adds [role/ownership read policies and protected workspace routes](authorization.md) to the existing authentication. Phase 7 adds the customer portal. See [working progress](progress.md) for focused continuation notes and [authentication setup](authentication.md) for local email capture. An origin remote now exists; earlier "no remote" statements describe the original foundation. Bookings remain closed, with browser and SMTP checks outstanding.
