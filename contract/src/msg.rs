use cosmwasm_std::{Addr, Uint64};
use serde::{Deserialize, Serialize};
use schemars::JsonSchema;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct InstantiateMsg {}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {
    AdoptFish { name: String },
    FeedFish { fish_id: u64 },
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum QueryMsg {
    FishStatus { address: Addr },
    AllFish {}
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct FullFishStatus {
    pub id: Uint64,
    pub name: String,
    pub age: Uint64,
    pub seconds_since_fed: Uint64,
    pub dead: bool,
    pub colour: u16
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct ShortFishStatus {
    pub id: Uint64,
    pub name: String,
    pub dead: bool,
    pub colour: u16
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum QueryAnswer {
    MyFishStatus(Vec<FullFishStatus>),
    AllFishStatus(Vec<ShortFishStatus>)
}

