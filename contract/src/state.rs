use cosmwasm_std::{CanonicalAddr, Timestamp, Uint64};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use secret_toolkit::storage::{Item, Keymap};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Fish {
    pub id: Uint64,
    pub name: String,
    pub owner: CanonicalAddr,
    pub created_at: Timestamp,
    pub last_fed: Timestamp,
    pub dead: bool,
    pub colour: u16
}

pub const FISH_COUNTER: Item<u64> = Item::new(b"fish_counter");
pub const FISHES: Keymap<u64, Fish> = Keymap::new(b"fishes");
pub const OWNER_TO_FISH: Keymap<CanonicalAddr, Vec<u64>> = Keymap::new(b"owner_to_fish");
pub const MAX_HUNGER_DURATION: u64 = 86400; // 24 hours
