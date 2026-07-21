# Contributing

Personal notes on how this repo is set up and how I work on it.

## Launching the project

```sh
nvm use            # optional, .nvmrc pins the Node version
npm install
npm start          # Metro bundler, keep running in its own terminal
npm run android     # in another terminal
npm run ios         # in another terminal (macOS only, needs `pod install` first)
```

iOS pods (first time / after native dep changes):

```sh
bundle install
cd ios && bundle exec pod install && cd ..
```

Other commands:

```sh
npm test              # jest
npm run lint           # eslint
npm run typecheck      # tsc --noEmit
npm run prettier       # check formatting
npm run prettier-format # format everything in place
```

Git hooks (husky + lint-staged): pre-commit runs eslint --fix and prettier on staged files, pre-push runs the test suite. CI (GitHub Actions) checks formatting, runs lint, typecheck, tests (with coverage thresholds) and a prod-dependency audit on every PR and on main, and builds the Android debug APK. Dependabot opens weekly grouped npm and GitHub Actions update PRs.

## E2E tests (Maestro)

Smoke flow in `maestro/transaction-flow.yaml`: creates a beneficiary, makes a transaction with them, restarts the app, and asserts the balance and history persisted.

```sh
# one-time install
curl -fsSL "https://get.maestro.mobile.dev" | bash

# needs a running emulator/simulator with the app installed
npm run android         # builds and installs on the running Android emulator
npm run test:e2e        # runs the Maestro flow
```

## Commit messages

Conventional Commits style, `<type>: <short summary>`:

- `feat:` a new feature
- `fix:` a bug fix
- `docs:` documentation only
- `style:` formatting, no code change
- `refactor:` code change that's neither a fix nor a feature
- `test:` adding or fixing tests
- `chore:` tooling, deps, config, CI

Keep messages in the imperative mood ("add x", not "added x"), one logical change per commit. Single line only — no body; details belong in the PR description.

## Pull requests

- One feature/fix per branch and per PR, branch name `type/short-description` (e.g. `feat/beneficiary-creation`).
- PR description: what changed and why, plus how to test it.
- Keep PRs small enough to review in one pass; split unrelated changes into separate PRs.
- Lint, typecheck, tests and the pre-commit hook must pass before requesting review (CI enforces this).
