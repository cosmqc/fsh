# FSH Uploader

Uploader scripts for the FSH blockchain fish tank

## Building the scripts

`npm install`

`npm run build`

## Uploading the contract to pulsar

Compile the contract in monorepo `contract/` folder: `make build-mainnet-reproducible`

Create a `.env` file and add your `MNEMONIC` to it. Google Accounts in Keplr don't seem to work (they have a private key hash, not a mnemonic), so make a different wallet with a seed phrase.

Run:

`npm run upload`

Record the resulting Code ID and Contract hash.

## Instantiating the contract

`npm run instantiate {Code ID} {Contract hash}`

Record the resulting Contract address. This can be used, along with the code hash, in the frontend react application (add to `.env` there).

## Integration test
The contract runs through a simple integration test by using the following command:
`npm run test {Code ID} {Contract hash}`

It's not very quick as each query/execute takes ~6 seconds, and there's a set of tests that need a fish to be dead as a precondition (~3 minutes).