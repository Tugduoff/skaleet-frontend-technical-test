# Contributing

Personal notes on how this repo is set up and how I work on it.

## Launching the project

```sh
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
npm run prettier-format # format everything in place
```

A pre-commit hook (husky + lint-staged) runs eslint --fix and prettier on staged files automatically.

## Commit messages

Conventional Commits style, `<type>: <short summary>`:

- `feat:` a new feature
- `fix:` a bug fix
- `docs:` documentation only
- `style:` formatting, no code change
- `refactor:` code change that's neither a fix nor a feature
- `test:` adding or fixing tests
- `chore:` tooling, deps, config, CI

Keep messages in the imperative mood ("add x", not "added x"), one logical change per commit.

## Pull requests

- One feature/fix per branch and per PR, branch name `type/short-description` (e.g. `feat/beneficiary-creation`).
- PR description: what changed and why, plus how to test it.
- Keep PRs small enough to review in one pass; split unrelated changes into separate PRs.
- Lint, tests and the pre-commit hook must pass before requesting review.
