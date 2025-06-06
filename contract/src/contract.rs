use cosmwasm_std::{
    entry_point, to_binary, Binary, CanonicalAddr, Deps, DepsMut, Env, MessageInfo, Response,
    StdError, StdResult,
};

use crate::msg::{ExecuteMsg, InstantiateMsg, QueryAnswer, QueryMsg};
use crate::state::{Fish, FISHES, MAX_HUNGER_DURATION};

#[entry_point]
pub fn instantiate(
    _deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    _msg: InstantiateMsg,
) -> StdResult<Response> {
    Ok(Response::default())
}

#[entry_point]
pub fn execute(deps: DepsMut, env: Env, info: MessageInfo, msg: ExecuteMsg) -> StdResult<Response> {
    let sender_canonical = deps.api.addr_canonicalize(info.sender.as_str())?;
    match msg {
        ExecuteMsg::AdoptFish { name } => adopt_fish(deps, env, sender_canonical, name),
        ExecuteMsg::FeedFish {} => feed_fish(deps, env, sender_canonical),
    }
}

fn adopt_fish(deps: DepsMut, env: Env, sender: CanonicalAddr, name: String) -> StdResult<Response> {
    if let Some(fish) = FISHES.get(deps.storage, &sender) {
        if !fish.dead {
            return Err(StdError::generic_err("You already have a living fish"));
        }
    }

    let fish = Fish {
        name,
        owner: sender.clone(),
        created_at: env.block.time,
        last_fed: env.block.time,
        dead: false,
    };

    FISHES.insert(deps.storage, &sender, &fish)?;

    Ok(Response::new().add_attribute("action", "adopt_fish"))
}

fn feed_fish(deps: DepsMut, env: Env, sender: CanonicalAddr) -> StdResult<Response> {
    let mut fish = match FISHES.get(deps.storage, &sender) {
        Some(f) => f,
        None => return Err(StdError::generic_err("You don't have a fish :(")),
    };

    if fish.dead {
        return Err(StdError::generic_err("Your fish is dead 😢"));
    }

    let hunger_duration = env.block.time.seconds() - fish.last_fed.seconds();
    if hunger_duration > MAX_HUNGER_DURATION {
        fish.dead = true;
        FISHES.insert(deps.storage, &sender, &fish)?;
        return Err(StdError::generic_err("Your fish has died of hunger"));
    }

    fish.last_fed = env.block.time;
    FISHES.insert(deps.storage, &sender, &fish)?;

    Ok(Response::new().add_attribute("action", "feed_fish"))
}


#[entry_point]
pub fn query(deps: Deps, env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::FishStatus { address } => {
            let sender_canonical = deps.api.addr_canonicalize(address.as_str())?;
            return fish_status(deps, env, sender_canonical)
        },
    }
}

fn fish_status(deps: Deps, env: Env, owner: CanonicalAddr) -> StdResult<Binary> {
    let fish = match FISHES.get(deps.storage, &owner) {
        Some(f) => f,
        None => return Err(StdError::generic_err("The owner doesn't have a fish.")),
    };

    let now = env.block.time.seconds();
    let time_since_fed = now - fish.last_fed.seconds();
    let age = now - fish.created_at.seconds();

    Ok(to_binary(&QueryAnswer::FishStatus {
        name: fish.name,
        age: age.into(),
        seconds_since_fed: time_since_fed.into(),
        dead: fish.dead,
    })?)
}
