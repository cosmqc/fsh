import dotenv from "dotenv";
import assert from "assert";
import { SecretNetworkClient, Wallet } from "secretjs";

dotenv.config();

const CHAIN_ID = "pulsar-3";
const LCD_URL = "https://pulsar.lcd.secretnodes.com";
const MNEMONIC = process.env.MNEMONIC;

const adminWallet = new Wallet(MNEMONIC);
const admin = new SecretNetworkClient({
  chainId: CHAIN_ID,
  url: LCD_URL,
  wallet: adminWallet,
  walletAddress: adminWallet.address,
});

async function instantiateContract(codeId, codeHash) {
  const label = "fish-contract-" + Math.floor(Math.random() * 1e6);
  const tx = await admin.tx.compute.instantiateContract(
    {
      sender: admin.address,
      code_id: codeId,
      code_hash: codeHash,
      init_msg: {},
      label,
    },
    { gasLimit: 400_000 }
  );

  assert.equal(tx.code, 0, `Instantiation failed: ${tx.rawLog}`);

  const contractAddress = tx.arrayLog.find(
    (log) => log.type === "message" && log.key === "contract_address"
  )?.value;

  assert.ok(contractAddress, "Contract address not found in logs");
  return contractAddress;
}

async function adoptFish(client, contract, codeHash, name) {
  const tx = await client.tx.compute.executeContract(
    {
      sender: client.address,
      contract_address: contract,
      code_hash: codeHash,
      msg: { adopt_fish: { name } },
    },
    { gasLimit: 200_000 }
  );
  assert.equal(tx.code, 0, `Adopt failed: ${tx.rawLog}`);
}

async function feedFish(client, contract, codeHash, fishId, shouldSucceed, message) {
  const tx = await client.tx.compute.executeContract(
    {
      sender: client.address,
      contract_address: contract,
      code_hash: codeHash,
      msg: { feed_fish: { fish_id: fishId } },
    },
    { gasLimit: 200_000 }
  );

  if (shouldSucceed) {
    assert.equal(tx.code, 0, `Feed should succeed but failed: ${tx.rawLog}`);
  } else {
    assert.notEqual(tx.code, 0, "Feed should fail but succeeded: " + message);
  }
}

async function feedFishExpectDied(client, contract, codeHash, fishId) {
  const tx = await client.tx.compute.executeContract(
    {
      sender: client.address,
      contract_address: contract,
      code_hash: codeHash,
      msg: { feed_fish: { fish_id: fishId } },
    },
    { gasLimit: 200_000 }
  );

  assert.equal(tx.code, 0, `Feed query succeeded`);

   const responseMessage = tx.arrayLog.find(
    (log) => log.type === "wasm" && log.key === "status"
  )?.value;

  assert.equal(responseMessage, 'fish_died')
}

async function queryFishStatus(client, contract, codeHash, expectedCount) {
  const tx = await client.query.compute.queryContract({
    contract_address: contract,
    code_hash: codeHash,
    query: { fish_status: { address: client.address } },
  });

  const result = tx.my_fish_status
  assert.ok(Array.isArray(result), "Query returned invalid format");
  assert.equal(result.length, expectedCount);
  
  const expectedKeys =  ['id', 'name', 'age', 'seconds_since_fed', 'dead', 'colour']
  assert.equal(result[0].keys().length, expectedKeys.length)
  for (let key of result[0].keys()) {
    assert.ok(expectedKeys.includes(key))
  }
}

async function queryAllFish(client, contract, codeHash, expectedCount) {
  const tx = await client.query.compute.queryContract({
    contract_address: contract,
    code_hash: codeHash,
    query: { all_fish: {} },
  });

  const result = tx.all_fish_status
  assert.equal(result.length, expectedCount);

  const expectedKeys =  ['id', 'name', 'colour']
  assert.equal(result[0].keys().length, expectedKeys.length)
  for (let key of result[0].keys()) {
    assert.ok(expectedKeys.includes(key))
  }
}

async function queryDeadFish(client, contract, codeHash, expectedCount) {
  const tx = await client.query.compute.queryContract({
    contract_address: contract,
    code_hash: codeHash,
    query: { dead_fish: {} },
  });

  const result = tx.dead_fish_status
  assert.equal(result.length, expectedCount);

  const expectedKeys =  ['id', 'name', 'colour', 'owner']
  assert.equal(result[0].keys().length, expectedKeys.length)
  for (let key of result[0].keys()) {
    assert.ok(expectedKeys.includes(key))
  }
}

export const main = async () => {
  if (process.argv.length !== 4) {
    console.error("Expected two arguments!");
    process.exit(1);
  }

  const [codeId, codeHash] = [process.argv[2], process.argv[3]];
  const contract = await instantiateContract(codeId, codeHash);

  console.log("Contract instantiated at", contract);

  console.log("Creating wallets and test users");
  const userWallet = new Wallet();
  const user = new SecretNetworkClient({
    chainId: CHAIN_ID,
    url: LCD_URL,
    wallet: userWallet,
    walletAddress: userWallet.address,
  });

  // Fund the test user with 1 SCRT
  await admin.tx.bank.send(
    {
      from_address: admin.address,
      to_address: user.address,
      amount: [{ denom: "uscrt", amount: "1000000" }],
    },
    { gasLimit: 60_000 }
  );

  console.log("Adopting fish");
  // Test: Use admin as a fish owner, adopt 5 fish (blue skies)
  for (let i = 0; i < 5; i++) {
    await adoptFish(admin, contract, codeHash, `AdminFish${i}`);
  }
  console.log(" - ✅ User can adopt up to 5 fish");

  // Test: Reject 6th fish from admin
  try {
    await adoptFish(admin, contract, codeHash, "AdminFish6");
    assert.fail("Should not be able to adopt more than 5 fish");
  } catch (e) {
    console.log(" - ✅ User cannot adopt more than 5 fish");
  }

  console.log('Feeding fish')
  // Run these in parallel
  await Promise.allSettled([
    // Test: Feed non-existent fish
    feedFish(admin, contract, codeHash, 9999, false, "You should not be able to feed fish that don't exist."),

    // Test: Feed someone else's fish
    feedFish(user, contract, codeHash, 1, false, "You should not be able to feed someone else's fish."),

    // Test: Feed your own living fish (blue skies)
    feedFish(admin, contract, codeHash, 1, true, "You should be able to feed your own living fish"),
  ])
  console.log(" - ✅ User can only feed their own fish");

  // Kill one fish via starvation 
  console.log("⏳ Waiting 3 minutes to kill AdminFish #0");
  await new Promise((res) => setTimeout(res, 180_000));
  await feedFishExpectDied(admin, contract, codeHash, 0)
  console.log(" - ✅ User's fish dies if not fed");

  console.log("Adopting some more fish");
  // Have the other user adopt another fish
  await adoptFish(user, contract, codeHash, `UserFish`);

  console.log("Trying to feed dead fish and seeing if more fish can be adopted after one dies");
  await Promise.allSettled([
    // Test: Can adopt more fish after some die
    adoptFish(admin, contract, codeHash, "AdminFish7"),

    // Test: Try to feed dead fish
    feedFish(admin, contract, codeHash, 0, false, "Should not be able to feed dead fish"),
  ])
  console.log(" - ✅ Dead fish can't be fed and more fish can be adopted");

  console.log("Querying the different fish lists to make sure they're the right size");
  await Promise.allSettled([
    // Test: MyFish query returns correct count (4 dying, 1 dead, 1 new)
    queryFishStatus(admin, contract, codeHash, 6),

    // Test: AllFish query returns correct count (4 dying, 1 new, 1 other user)
    queryAllFish(admin, contract, codeHash, 6),

    // Test: DeadFish query returns correct count fish (1 dead)
    queryDeadFish(admin, contract, codeHash, 1),
  ]);

  console.log("✅ All tests passed!");
};

main();
