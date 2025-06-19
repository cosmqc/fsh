use cosmwasm_std::{
    entry_point, to_binary, Binary, CanonicalAddr, Deps, DepsMut, Env, MessageInfo, Response,
    StdError, StdResult,
};

use crate::msg::{ExecuteMsg, ShortFishStatus, FullFishStatus, InstantiateMsg, QueryAnswer, QueryMsg, DeadFishStatus};
use crate::state::{Fish, FISHES, FISH_COUNTER, MAX_HUNGER_DURATION, OWNER_TO_FISH};

/**
 * Instantiate a contract. Starts a counter so fish have unique IDs.
 */
#[entry_point]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    _msg: InstantiateMsg,
) -> StdResult<Response> {
    FISH_COUNTER.save(deps.storage, &0)?;
    Ok(Response::default())
}

#[entry_point]
pub fn execute(deps: DepsMut, env: Env, info: MessageInfo, msg: ExecuteMsg) -> StdResult<Response> {
    let sender_canonical = deps.api.addr_canonicalize(info.sender.as_str())?;
    match msg {
        ExecuteMsg::AdoptFish { name } => adopt_fish(deps, env, sender_canonical, name),
        ExecuteMsg::FeedFish { fish_id } => feed_fish(deps, env, sender_canonical, fish_id),
    }
}

/**
 * Adopt a fish. A user can have up to 5 alive fish at a time.
 * Fish are named with user input and are given a random colour.
 */
fn adopt_fish(deps: DepsMut, env: Env, sender: CanonicalAddr, name: String) -> StdResult<Response> {
    let mut fish_ids = OWNER_TO_FISH.get(deps.storage, &sender).unwrap_or_default();
    let num_alive_fish = fish_ids.iter()
        .filter(|fish_id| {
            if let Some(fish) = FISHES.get(deps.storage, fish_id) {
                !fish.dead
            } else {
                false
            }
        })
        .count();

    if num_alive_fish >= 5 {
        return Err(StdError::generic_err("You have too many alive fish to adopt more!"));
    }

    // If we can't get a colour, just default to no hue shift
    let colour = random_colour(&env).unwrap_or_default();
    let fish_id = FISH_COUNTER.load(deps.storage)?;
    FISH_COUNTER.save(deps.storage, &(&fish_id + 1))?;

    let fish = Fish {
        id: fish_id.clone().into(),
        name,
        owner: sender.clone(),
        created_at: env.block.time,
        last_fed: env.block.time,
        dead: false,
        colour,
    };

    fish_ids.push(fish_id.clone());
    FISHES.insert(deps.storage, &fish_id, &fish)?;
    OWNER_TO_FISH.insert(deps.storage, &sender, &fish_ids)?;

    Ok(Response::new().add_attribute("action", "adopt_fish"))
}

/**
 * Feed your fish. If a fish is fed after the MAX_HUNGER_DURATION, they die.
 * This have to be done after the fact (and not right as they get too hungry)
 * as queries can't update the storage.
 */
fn feed_fish(deps: DepsMut, env: Env, sender: CanonicalAddr, fish_id: u64) -> StdResult<Response> {
    let mut fish = match FISHES.get(deps.storage, &fish_id) {
        Some(f) => f,
        None => return Err(StdError::generic_err("This fish doesn't exist!")),
    };

    if fish.owner != sender {
        return Err(StdError::generic_err("This is not your fish!"));
    }

    if fish.dead {
        return Err(StdError::generic_err("Your fish is dead"));
    }

    // If the fish has been hungry for too long
    let hunger_duration = env.block.time.seconds() - fish.last_fed.seconds();
    if hunger_duration > MAX_HUNGER_DURATION {
        fish.dead = true;
        FISHES.insert(deps.storage, &fish_id, &fish)?;

        // Must be Ok instead of Err, otherwise the storage insert gets rolled back
        return Ok(
            Response::new()
                .add_attribute("action", "feed_fish")
                .add_attribute("status", "fish_died")
                .add_attribute("reason", "hunger")
        );
    }

    // If all good, feed the fish and update the storage
    fish.last_fed = env.block.time;
    FISHES.insert(deps.storage, &fish_id, &fish)?;

    Ok(Response::new().add_attribute("action", "feed_fish"))
}


#[entry_point]
pub fn query(deps: Deps, env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::FishStatus { address } => {
            let sender_canonical = deps.api.addr_canonicalize(address.as_str())?;
            return fish_status(deps, env, sender_canonical);
        }
        QueryMsg::AllFish {} => return all_fish(deps, env),
        QueryMsg::DeadFish {} => return dead_fish(deps, env)
    }
}

/**
 * Returns a list of the sender's fish, including dead ones.
 * Gives the most information out of the queries.
 */
fn fish_status(deps: Deps, env: Env, sender: CanonicalAddr) -> StdResult<Binary> {
    // Get the IDs of all the fish the owner has
    let fish_ids = OWNER_TO_FISH
        .get(deps.storage, &sender)
        .unwrap_or_default();

    let now = env.block.time.seconds();
    let mut statuses = Vec::new();

    // Iterate over them
    for fish_id in fish_ids {
        // Get the fish from the fish ID
        let fish = FISHES
            .get(deps.storage, &fish_id).unwrap();

        let age = now - fish.created_at.seconds();
        let time_since_fed = now - fish.last_fed.seconds();

        statuses.push(FullFishStatus {
            id: fish_id.into(),
            name: fish.name,
            age: age.into(),
            seconds_since_fed: time_since_fed.into(),
            dead: fish.dead,
            colour: fish.colour,
        });
    }

    Ok(to_binary(&QueryAnswer::MyFishStatus(statuses))?)
}

/**
 * Returns a list of all alive fish in the tank.
 * Gives minimal information (as it's only used for the fish swimming around)
 */
fn all_fish(deps: Deps, _env: Env) -> StdResult<Binary> {
    // filter the fish so we only have the alive ones
    let alive_fishes: Vec<ShortFishStatus> = FISHES
        .iter(deps.storage)?
        .filter_map(|item| match item {
            Ok((id, fish)) if !fish.dead => Some(Ok(ShortFishStatus {
                id: id.into(),
                name: fish.name,
                colour: fish.colour,
            })),
            Ok(_) => None, // Dead fish, skip
            Err(err) => Some(Err(err)), // Another error, bubble up
        })
        .collect::<StdResult<Vec<_>>>()?;

    Ok(to_binary(&QueryAnswer::AllFishStatus(alive_fishes))?)
}

/**
 * Returns a list of all dead fish in the tank.
 * Gives the same fish information as all_fish, except the owner is also given.
 */
fn dead_fish(deps: Deps, _env: Env) -> StdResult<Binary> {
    // filter the fish so we only have the dead ones
    let dead_fishes: Vec<DeadFishStatus> = FISHES
        .iter(deps.storage)?
        .filter_map(|item| match item {
            Ok((id, fish)) if fish.dead => Some(Ok(DeadFishStatus {
                id: id.into(),
                name: fish.name,
                colour: fish.colour,
                owner: deps.api.addr_humanize(&fish.owner).unwrap().to_string()
            })),
            Ok(_) => None, // Alive fish
            Err(err) => Some(Err(err)), // An error, bubble up
        })
        .collect::<StdResult<Vec<_>>>()?;

    Ok(to_binary(&QueryAnswer::DeadFishStatus(dead_fishes))?)
}

/**
 * Returns a colour based on on-chain randomness.
 */
fn random_colour(env: &Env) -> StdResult<u16> {
    let randomness = env
        .block
        .random
        .clone()
        .ok_or_else(|| StdError::generic_err("No randomness available in env.block.random"))?;

    // Use the first 2 bytes to form a u16 number
    let bytes = randomness.as_slice();
    if bytes.len() < 2 {
        return Err(StdError::generic_err("Insufficient randomness bytes"));
    }

    let raw: u32 = u32::from_be_bytes([bytes[0], bytes[1], bytes[2], bytes[3]]);
    let result = (raw % 360) as u16;

    Ok(result)
}
