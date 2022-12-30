---
sidebar_position: 2
---

# Setting up

ASAP can be ran either locally or remote.

## Running locally

Clone the [repo](https://github.com/DrInfinite) locally and install the top level dependencies.

```
$ git clone git@github.com:DrInfinite/asap.git

$ cd proofchain && npm install
```

Run Ganache (local blockchain)

```
npm run ganache
```

Contracts need to be compiled. Ganache must be running in the background, so I suggest opening a new terminal for running the following commands.

```
$ cd ./truffle
$ npm install
$ npm run migrate:test
```

Contracts are now compiled, .env file contains the Factory contracts address in the local blockchain. We can now run the frontend.
Run the frontend.

```
$ cd ../frontend
$ npm install
$ npm run dev
```
