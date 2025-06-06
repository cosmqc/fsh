import { useContext } from "react";
import { SecretJsContext } from "./SecretJsContext";
import { QueryError, WalletError } from "./SecretJsError";

const contractCodeHash = import.meta.env.VITE_CONTRACT_CODE_HASH;
const contractAddress = import.meta.env.VITE_CONTRACT_ADDR;

type FishStatus = {
    name: string;
    age: number;
    seconds_since_fed: number;
    dead: boolean;
};

type FishStatusResponse = FishStatus | string;

const SecretJsFunctions = () => {
    const context = useContext(SecretJsContext);

    if (!context) {
        throw new Error("SecretJsFunctions must be used within a SecretJsContextProvider");
    }

    const { secretJs, secretAddress } = context;

    const adopt_fish = async (name: string): Promise<void> => {
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
    };

    const feed_fish = async (): Promise<void> => {
        if (!secretJs || !secretAddress) throw new WalletError("no wallet connected");

        const msg = {
            sender: secretAddress,
            contract_address: contractAddress,
            code_hash: contractCodeHash,
            msg: {
                feed_fish: {}
            }
        };

        const tx = await secretJs.tx.compute.executeContract(msg, { gasLimit: 50_000 });
        console.log(tx);
    };

    const query_fish_status = async (): Promise<FishStatus> => {
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

    return {
        adopt_fish,
        feed_fish,
        query_fish_status,
    };
};

export { SecretJsFunctions };
export type { FishStatus, FishStatusResponse }
