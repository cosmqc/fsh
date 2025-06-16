use cosmwasm_std::{
    entry_point, to_binary, Binary, CanonicalAddr, Deps, DepsMut, Env, MessageInfo, Response,
    StdError, StdResult,
};

use crate::msg::{ExecuteMsg, ShortFishStatus, FullFishStatus, InstantiateMsg, QueryAnswer, QueryMsg};
use crate::state::{Fish, FISHES, FISH_COUNTER, MAX_HUNGER_DURATION, OWNER_TO_FISH};

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

fn adopt_fish(deps: DepsMut, env: Env, sender: CanonicalAddr, name: String) -> StdResult<Response> {
    let mut fish_ids = OWNER_TO_FISH.get(deps.storage, &sender).unwrap_or_default();

    if fish_ids.len() >= 5 {
        return Err(StdError::generic_err("You have too many fish!"));
    }

    let colour = random_colour(&env).unwrap_or(0);
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

fn feed_fish(deps: DepsMut, env: Env, sender: CanonicalAddr, fish_id: u64) -> StdResult<Response> {
    let mut fish = match FISHES.get(deps.storage, &fish_id) {
        Some(f) => f,
        None => return Err(StdError::generic_err("This fish doesn't exist!")),
    };

    if fish.owner != sender {
        return Err(StdError::generic_err("This is not your fish!"));
    }

    if fish.dead {
        return Err(StdError::generic_err("Your fish is dead 😢"));
    }

    let hunger_duration = env.block.time.seconds() - fish.last_fed.seconds();
    if hunger_duration > MAX_HUNGER_DURATION {
        fish.dead = true;
        FISHES.insert(deps.storage, &fish_id, &fish)?;
        return Err(StdError::generic_err("Your fish has died of hunger"));
    }

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
    }
}

fn fish_status(deps: Deps, env: Env, sender: CanonicalAddr) -> StdResult<Binary> {
    let fish_ids = OWNER_TO_FISH
        .get(deps.storage, &sender)
        .unwrap_or_default();

    let now = env.block.time.seconds();

    let mut statuses = Vec::new();

    for fish_id in fish_ids {
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

fn all_fish(deps: Deps, _env: Env) -> StdResult<Binary> {
    let fishes: Vec<ShortFishStatus> = FISHES
        .iter(deps.storage)?
        .map(|item| {
            let (id, fish) = item?;
            Ok(ShortFishStatus {
                id: id.into(),
                name: fish.name,
                dead: fish.dead,
                colour: fish.colour,
            })
        })
        .collect::<StdResult<Vec<_>>>()?;

    Ok(to_binary(&QueryAnswer::AllFishStatus(fishes))?)
}

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

    let raw = u16::from_be_bytes([bytes[0], bytes[1]]);
    let result = raw % 360;

    Ok(result)
}
