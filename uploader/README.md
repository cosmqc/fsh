# Uploader scripts for the secret auction example

## Building

`npm install`

`npm run build`

## Uploading the contract to pulsar

Compile the contract in monorepo `contract/` folder: `make build-mainnet-reproducible`

Create a `.env` file and add your `MNEMONIC` to it. Google Accounts in Keplr don't seem to work (they have a private key hash, not a mnemonic), so make a different wallet with a seed phrase.

Run:

`npm run upload`

Record the resulting Code id and Contract hash.

## Instantiating the contract

`npm run instantiate {Code id} {Contract hash}`

Record the resulting Contract address. This can be used, along with the code hash, in the frontend react application (add to `.env` there).