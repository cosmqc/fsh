import { useContext, useEffect, useState } from "react";
import { SecretJsFunctions } from "../secretjs/SecretJsFunctions";
import type { FishStatus } from "../secretjs/SecretJsFunctions";
import { SecretJsContext } from "../secretjs/SecretJsContext";

import FishTank from "../components/FishTank";
import { FishContextProvider } from "../contexts/fishes";

const inputButtonStyle = { margin: "5px" };
const FishTamagotchiUI = () => {
    const { adopt_fish, feed_fish, query_my_fish, query_all_fish } = SecretJsFunctions();
    const { connectWallet } = useContext(SecretJsContext)!;

    const [allFish, setAllFish] = useState<FishStatus[]>([]);
    const [queryResult, setQueryResult] = useState<string>("");
    const [status, setStatus] = useState<FishStatus | null>(null);

    const [adoptFishField, setAdoptFishField] = useState("");
    const [feedFishField, setFeedFishField] = useState("");
    const [queryFishField, setQueryFishField] = useState("");

    const handle = async (fn: () => Promise<any>) => {
        const res = await fn();
        setQueryResult(JSON.stringify(res, null, 2));

        if (res?.all_fish_status) {
            // List of fish
            setAllFish(res.all_fish_status as FishStatus[]);
        } else if (res?.fish_status) {
            // One fish
            setStatus(res.fish_status as FishStatus);
        } else if (res.code == 3) {
            // Pull the error out of the string it gives and show it.
            const rawLog = res.rawLog || "Unknown blockchain error";
            const match = rawLog.match(/Generic error: (.+?)(:|$)/);
            const extracted = match ? match[1] : rawLog;
            alert(extracted);
        }
    };

    useEffect(() => {
        connectWallet();
    }, []);

    return (
        <div style={{ fontFamily: "sans-serif", width: "100vw", minHeight: "100vh", padding: "1rem" }}>
            <FishContextProvider>
                <FishTank allFish={allFish} />
            </FishContextProvider>

            {/* Hidden canvas asset */}
            <div style={{ display: "none" }}>
                <img id="sourceFish" src="fish.png" width="20%" />
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
                    style={{
                        margin: '5px' 
                    }}
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
                    style={{
                        margin: '5px' 
                    }}
                    >
                        Feed Fish
                    </button>
                </div>
                <h2>Query Fish</h2>
                <button
                    onClick={() => handle(() => query_my_fish())}
                style={{
                    margin: '5px' 
                }}
                >
                    Query My Fish
                </button>
                <button
                    onClick={() => handle(() => query_all_fish())}
                    style={{
                        margin: '5px' 
                    }}
                >
                    Query All Fish
                </button>

            <h2>Fish Status</h2>
            {status ? (
                <div>
                    <p>
                        <strong>Name:</strong> {status.name}
                    </p>
                    <p>
                        <strong>Age:</strong> {status.age} seconds
                    </p>
                    <p>
                        <strong>Last Fed:</strong> {status.seconds_since_fed}s ago
                    </p>
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
