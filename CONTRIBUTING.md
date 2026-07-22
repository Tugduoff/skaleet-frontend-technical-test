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

Git hooks (husky + lint-staged): pre-commit runs eslint --fix and prettier on staged files, pre-push runs the test suite. CI (GitHub Actions) checks formatting, runs lint, typecheck, tests (with coverage thresholds) and a prod-dependency audit on every PR and on main; the Android debug APK build runs on main pushes, on PRs touching native files, and manually (to save CI minutes). Dependabot opens weekly grouped npm and GitHub Actions update PRs.

## Releasing (Android)

Release builds are signed with an upload keystore that is never committed (`*.keystore` is gitignored, `debug.keystore` excepted) and are minified with R8/Proguard.

1. Generate an upload keystore — once, and keep it (and its passwords) safe: losing it means losing the ability to publish updates.

   ```sh
   keytool -genkeypair -v -storetype PKCS12 -keystore android/app/upload-keystore.keystore -alias upload -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Provide the credentials as gradle properties — in `~/.gradle/gradle.properties` locally, or injected from CI secrets (never in the repo):

   ```properties
   MYAPP_UPLOAD_STORE_FILE=upload-keystore.keystore
   MYAPP_UPLOAD_STORE_PASSWORD=*****
   MYAPP_UPLOAD_KEY_ALIAS=upload
   MYAPP_UPLOAD_KEY_PASSWORD=*****
   ```

3. Build the release APK (or pass the same values as `-P` flags instead of step 2):

   ```sh
   cd android && ./gradlew assembleRelease
   ```

Without the `MYAPP_UPLOAD_*` properties the release build fails on purpose — a release is never silently signed with the debug keystore. Keep the R8 mapping file (`android/app/build/outputs/mapping/release/`) for crash deobfuscation.

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
