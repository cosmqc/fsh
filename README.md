# FSH - Fishies Swimmin Hungry

Monorepo for the FSH blockchain fish tank 

- `contract/` contains the smart contract code
- `uploader/` contains scripts to upload the contract and test it
- `frontend/` contains a React app for interacting with the smart contract

## Setup
 - Make sure you have a wallet with a decent amount of Secret Testnet SCRT (if not see below)
 - Create `uploader/.env` and add your wallet mnemonic: `MNEMONIC="<mnemonic sentence>"`
 - `chmod +x build_and_upload.sh`
 - `./build_and_upload.sh`
 - The above command will run a local frontend instance automatically, but frontends can be now run from anywhere:
   - `cd frontend`
   - `npm run install`
   - `npm run dev`
 - Navigate to the address Vite gives you. Default is http://localhost:5173/

## Getting Testnet SCRT
 - Sign up to a wallet that supports SCRT (I used Keplr).
   - If using Keplr, make sure you don't sign up with Google - it doesn't give you a mnemonic
 - Take your SCRT Testnet wallet address and enter it into a faucet (https://pulsar-3-faucet.vercel.app/)
 - You're good to continue with the setup :)