# FSH - Fishies Swimmin Hungry

Monorepo for secret auction example

- `contract/` contains the smart contract code
- `uploader/` contains scripts to upload the contract and test it
- `frontend/` contains a React app for interacting with the auction contract

## Setup
 - Create `uploader/.env` and add your wallet mnemonic: `MNEMONIC="<mnemonic sentence>"`
 - `chmod +x build_and_upload.sh`
 - `./build_and_upload.sh`
 - The above command will run a local frontend instance automatically, but frontends can be now run from anywhere:
   - `cd frontend`
   - `npm run install`
   - `npm run dev`
 - Navigate to the address Vite gives you. Default is http://localhost:5173/
