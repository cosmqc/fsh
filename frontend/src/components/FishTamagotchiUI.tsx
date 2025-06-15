import { useContext, useState, useEffect } from "react";
import { SecretJsFunctions } from "../secretjs/SecretJsFunctions";
import type { FishStatus } from "../secretjs/SecretJsFunctions";
import { SecretJsContext } from "../secretjs/SecretJsContext";
import { WalletIcon } from "@heroicons/react/24/outline";

import FishTank from '../components/FishTank'
import { FishContextProvider } from '../contexts/fishes'

const FishTamagotchiUI = () => {
    const {
        adopt_fish,
        feed_fish,
        query_fish_status,
        query_all_fish
    } = SecretJsFunctions();
    const { connectWallet, secretAddress } = useContext(SecretJsContext)!;
    const [allFish, setAllFish] = useState<FishStatus[]>([]);
    const [adoptFishField, setAdoptFishField] = useState("");
    const [feedFishField, setFeedFishField] = useState("");
    const [status, setStatus] = useState<FishStatus | null>(null);
    const [queryResult, setQueryResult] = useState<string>("");

    const handle = async (fn: () => Promise<any>) => {
        try {
            const res = await fn();
            setQueryResult(JSON.stringify(res));
            if (res.all_fish_status) {
                const fishes: FishStatus[] = res.all_fish_status
                console.log(fishes)
                setAllFish(fishes);
            }
        } catch (err: any) {
            alert(err.message || "Unknown error");
        }
    };

    return (
        <div style={{ fontFamily: "sans-serif", width: "100vw", minHeight: "100vh", margin: "0", padding: "1px", background: "linear-gradient(#2191FB, #2151aB)" }}>
            <div style={{zIndex: 1}}>
            <FishContextProvider>
                <FishTank allFish={allFish} />
            </FishContextProvider>
            </div>
            {/* Div to store elements that exist in the canvas */}
            <div style={{
                display: "none"
            }}>
                <img
                    id="sourceFish"
                    src="fish.png"
                    width="20%"
                />
            </div>
            <div style={{zIndex: 2}}>
            <h2>Connect Wallet</h2>
            <div>
                <WalletIcon
                    onClick={connectWallet}
                    style={{ width: "48px", height: "48px", color: "black", cursor: "pointer" }}
                />
            </div>

            <h2>Adopt a Fish</h2>
            <div style={{ marginBottom: "1rem" }}>
                <label>
                    <input
                        type="text"
                        value={adoptFishField}
                        onChange={(e) => setAdoptFishField(e.target.value)}
                    />
                </label>
                <button
                    onClick={() => handle(() => adopt_fish(adoptFishField))}
                    disabled={!adoptFishField.trim()}
                >
                    Adopt Fish
                </button>
            </div>
            <h2>Feed Fish</h2>
            <div style={{ marginBottom: "1rem" }}>
                <label>
                    <input
                        type="text"
                        value={feedFishField}
                        onChange={(e) => setFeedFishField(e.target.value)}
                    />
                </label>
                <button
                    onClick={() => handle(() => feed_fish(feedFishField))}
                    disabled={!feedFishField.trim()}
                >
                    Feed Fish
                </button>
            </div>
            <button
                onClick={() => handle(() => query_all_fish())}
            >
                Query All Fish
            </button>

            <h2>Fish Status</h2>
            {status ? (
                <div>
                    <p><strong>Name:</strong> {status.name}</p>
                    <p><strong>Age:</strong> {status.age} seconds</p>
                    <p><strong>Last Fed:</strong> {status.seconds_since_fed}s ago</p>
                </div>
            ) : (
                <p>No fish data available</p>
            )}

            <h2>Raw Query Response</h2>
            <pre
                style={{
                    backgroundColor: "#f9f9f9",
                    border: "1px solid #ccc",
                    padding: "1rem",
                    maxHeight: "300px",
                    overflowY: "auto",
                    margin: "10px"
                }}
            >
                {queryResult}
            </pre>
        </div>
        </div>
    );
};

export default FishTamagotchiUI;
