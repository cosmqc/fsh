import { useContext } from "react";
import { SecretJsContext } from "./SecretJsContext";
import { QueryError, WalletError } from "./SecretJsError";
import type { TxResponse } from "secretjs";

const contractCodeHash = import.meta.env.VITE_CONTRACT_CODE_HASH;
const contractAddress = import.meta.env.VITE_CONTRACT_ADDR;

type FishStatus = {
    id: number;
    name: string;
    age: number;
    seconds_since_fed: number;
    dead: boolean;
    colour: number;
};

type FishStatusResponse = FishStatus | string;

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

    const feed_fish = async (fishIdString: string): Promise<TxResponse> => {
        if (!secretJs || !secretAddress) throw new WalletError("no wallet connected");

        const msg = {
            sender: secretAddress,
            contract_address: contractAddress,
            code_hash: contractCodeHash,
            msg: {
                feed_fish: {
                    fish_id: parseInt(fishIdString)
                }
            }
        };

        const tx = await secretJs.tx.compute.executeContract(msg, { gasLimit: 50_000 });
        console.log(tx);
        return tx
    };

    const query_my_fish = async (): Promise<FishStatus> => {
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

        const result = await secretJs.query.compute.queryContract(queryMsg) as FishStatusResponse;

        if (typeof result === "string") {
            throw new QueryError(result);
        }

        return result;
    };

    const query_all_fish = async (): Promise<FishStatus> => {
        if (!secretJs || !secretAddress) throw new WalletError("no wallet connected");

        const queryMsg = {
            contract_address: contractAddress,
            query: {
                all_fish: {}
            },
            code_hash: contractCodeHash,
        };

        const result = await secretJs.query.compute.queryContract(queryMsg) as FishStatusResponse;

        if (typeof result === "string") {
            throw new QueryError(result);
        }

        return result;
    };

    return {
        adopt_fish,
        feed_fish,
        query_my_fish,
        query_all_fish
    };
};

export { SecretJsFunctions };
export type { FishStatus, FishStatusResponse }
