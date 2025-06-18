import { useContext } from "react";
import { SecretJsContext } from "./SecretJsContext";
import { QueryError, WalletError } from "./SecretJsError";
import type { TxResponse } from "secretjs";

const contractCodeHash = import.meta.env.VITE_CONTRACT_CODE_HASH;
const contractAddress = import.meta.env.VITE_CONTRACT_ADDR;

type FullFishStatus = {
    id: number;
    name: string;
    age: number;
    seconds_since_fed: number;
    colour: number;
};

type ShortFishStatus = {
    id: number;
    name: string;
    colour: number;
    dead: boolean;
}

type DeadFishStatus = {
    id: number;
    name: string;
    colour: number;
    owner: string;
}

type FullFishStatusResponse = FullFishStatus[] | string;
type ShortFishStatusResponse = ShortFishStatus[] | string;
type DeadFishStatusResponse = DeadFishStatus[] | string;

const SecretJsFunctions = () => {
    const context = useContext(SecretJsContext);

    if (!context) {
        throw new Error("SecretJsFunctions must be used within a SecretJsContextProvider");
    }

    const { secretJs, secretAddress } = context;

    const adopt_fish = async (name: string): Promise<TxResponse> => {
        if (!secretJs || !secretAddress) throw new WalletError("no wallet connected");

        const msg = {
            sender: secretAddress,
            contract_address: contractAddress,
            code_hash: contractCodeHash,
            msg: {
                adopt_fish: {
                    name
                }
            }
        };

        const tx = await secretJs.tx.compute.executeContract(msg, { gasLimit: 50_000 });
        console.log(tx);
        return tx
    };

    const feed_fish = async (fish_id: number): Promise<TxResponse> => {
        if (!secretJs || !secretAddress) throw new WalletError("no wallet connected");

        // For some reason, if I don't do this, the contract converts it to a string and
        // complains its the wrong type. Man on bicycle with stick vibes
        let fish_id_number = parseInt(fish_id.toString())

        const msg = {
            sender: secretAddress,
            contract_address: contractAddress,
            code_hash: contractCodeHash,
            msg: {
                feed_fish: {
                    fish_id: fish_id_number
                }
            }
        };

        const tx = await secretJs.tx.compute.executeContract(msg, { gasLimit: 50_000 });
        console.log(tx);
        return tx
    };

    const query_my_fish = async (): Promise<FullFishStatusResponse> => {
        if (!secretJs || !secretAddress) throw new WalletError("no wallet connected");

        const queryMsg = {
            contract_address: contractAddress,
            query: {
                fish_status: {
                    address: secretAddress
                }
            },
            code_hash: contractCodeHash,
        };

        const result = await secretJs.query.compute.queryContract(queryMsg) as FullFishStatusResponse;

        if (typeof result === "string") {
            throw new QueryError(result);
        }

        return result;
    };

    const query_all_fish = async (): Promise<ShortFishStatusResponse> => {
        if (!secretJs || !secretAddress) throw new WalletError("no wallet connected");

        const queryMsg = {
            contract_address: contractAddress,
            query: {
                all_fish: {}
            },
            code_hash: contractCodeHash,
        };

        const result = await secretJs.query.compute.queryContract(queryMsg) as ShortFishStatusResponse;

        if (typeof result === "string") {
            throw new QueryError(result);
        }



        return result;
    };

    const query_dead_fish = async (): Promise<DeadFishStatusResponse> => {
        if (!secretJs || !secretAddress) throw new WalletError("no wallet connected");

        const queryMsg = {
            contract_address: contractAddress,
            query: {
                dead_fish: {}
            },
            code_hash: contractCodeHash,
        };

        const result = await secretJs.query.compute.queryContract(queryMsg) as DeadFishStatusResponse;

        if (typeof result === "string") {
            throw new QueryError(result);
        }

        return result;
    };

    return {
        adopt_fish,
        feed_fish,
        query_my_fish,
        query_all_fish,
        query_dead_fish
    };
};

export { SecretJsFunctions };
export type {
    ShortFishStatus,
    FullFishStatus,
    DeadFishStatus,
    ShortFishStatusResponse,
    FullFishStatusResponse,
    DeadFishStatusResponse
}
