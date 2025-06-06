import { useContext, useState, useEffect } from "react";
import { SecretJsFunctions } from "./secretjs/SecretJsFunctions";
import type { FishStatus } from "./secretjs/SecretJsFunctions";
import { SecretJsContext } from "./secretjs/SecretJsContext";
import { WalletIcon } from "@heroicons/react/24/outline";
const FishTamagotchiUI = () => {
    const {
        adopt_fish,
        feed_fish,
        query_fish_status,
    } = SecretJsFunctions();
    const { connectWallet, secretAddress } = useContext(SecretJsContext)!;

    const [fishName, setFishName] = useState("");
    const [status, setStatus] = useState<FishStatus | null>(null);
    const [queryResult, setQueryResult] = useState<string>("");

    const handle = async (fn: () => Promise<any>) => {
        try {
            const res = await fn();
            setQueryResult(JSON.stringify(res));   
            if (res) {
                const fish : FishStatus = res.fish_status
                console.log(fish)
                setStatus(fish);
            }
        } catch (err: any) {
            alert(err.message || "Unknown error");
        }
    };

    useEffect(() => {
        if (secretAddress) {
            handle(() => query_fish_status());
        }
    }, [secretAddress]);

    return (
        <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
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
                    Fish Name:
                    <input
                        type="text"
                        value={fishName}
                        onChange={(e) => setFishName(e.target.value)}
                    />
                </label>
                <button
                    onClick={() => handle(() => adopt_fish(fishName))}
                    disabled={!fishName.trim()}
                >
                    Adopt Fish
                </button>
                <button
                    onClick={() => handle(() => query_fish_status())}
                >
                    Query Fish
                </button>
            </div>

            <h2>Feed Fish</h2>
            <div style={{ marginBottom: "1rem" }}>
                <button onClick={() => handle(feed_fish)}>
                    Feed
                </button>
            </div>

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
                }}
            >
                {queryResult}
            </pre>
        </div>
    );
};

export default FishTamagotchiUI;
