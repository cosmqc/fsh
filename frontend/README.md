# FSH Frontend

Frontend for the FSH blockchain fish tank.

## Installation and deployment
- `npm run install`
- Make sure you've got your .env file set up, an example is in frontend/.env.example.
  - The missing parameters are either generated when you upload/instantiate the contract (`./build_and_upload.sh` in the root directory or follow the instructions in `uploader/README.md`), or given to you by someone who has.
- `npm run dev`

## Thanks
  - Magnus Junghard / ChunkyDotDev for the original idea and a starting point for fish movement
    - https://github.com/chunkydotdev/fish-tank
    - https://www.youtube.com/watch?v=sXk-ZBTdaVA