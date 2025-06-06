use cosmwasm_std::{CanonicalAddr, Timestamp};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use secret_toolkit::storage::Keymap;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Fish {
    pub name: String,
    pub owner: CanonicalAddr,
    pub created_at: Timestamp,
    pub last_fed: Timestamp,
    pub dead: bool,
}

pub const FISHES: Keymap<CanonicalAddr, Fish> = Keymap::new(b"fishes");
pub const MAX_HUNGER_DURATION: u64 = 86400; // 24 hours
