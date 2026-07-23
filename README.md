# Introduction

We're thrilled to have you at this stage of our selection process! This test is designed to assess your skills and approach to problem-solving in a practical scenario. Please carefully follow the instructions below and ensure you read through the entire document. Good luck!

# Set up the Project

A significant challenge when working with React Native is setting up a complete environment before being able to run the project. We have intentionally omitted these instructions to assess your ability to independently set up said environment.

# Technical Test

You will be working on an application that facilitates transactions to beneficiaries. To successfully complete the test, you will need to implement the following features:

- Introduce a new page to create a beneficiary, including fields for their first name, last name, and IBAN. Additionally, incorporate an IBAN validator to ensure the IBAN's validity.
- Enable the selection of a beneficiary from a list when making a transaction.
- Preserve the state of the application so that upon reopening, the list of beneficiaries, transaction history, and balance are retained.

Note: you have free rein in how you want to implement this test, give it you best shot!

# Result

Please share with us your Git repository where you have stored your implemented solution. Document all the commands needed to install and launch this project, excluding the installation of any external SDKs/platforms, our focus will remain strictly on this project.

We hope that you will enjoy taking this test, best of luck!

## Requirements

- Node >= 24 (see `.nvmrc`)
- iOS/Android SDKs and simulators/emulators set up as per the React Native environment setup guide (not covered here)

## Install

```bash
npm install
```

## Run

Start the Metro bundler:

```bash
npm start
```

In another terminal, launch the app on a simulator/emulator:

```bash
npm run ios
# or
npm run android
```

## Other useful commands

```bash
npm run typecheck   # TypeScript type checking
npm run lint        # ESLint
npm run prettier    # Check formatting
npm test            # Unit tests (Jest)
npm run test:e2e    # End-to-end tests (Maestro), app must already be running on a device/simulator
```
