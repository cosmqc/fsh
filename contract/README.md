# FSH Smart Contract

Smart contract for the FSH blockchain fish tank.

### Mac M# chips
Mac Arm computers do not have all the needed build libraries to create a correct version of the wasm file for secret network. The easiest solution is to install docker and build with the reproducible make target.

`brew install --cask docker`

`make build-mainnet-reproducible`

This will build the contract using a linux image in docker.

## Thanks
 - Ben Adams / darwinzer0 for the starting point for this contract
    - https://hackmd.io/@darwinzer0/HJD0p5n60