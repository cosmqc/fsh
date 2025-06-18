import { useContext, useEffect, useState } from "react";
import { SecretJsFunctions } from "../secretjs/SecretJsFunctions";
import type { ShortFishStatus, FullFishStatus } from "../secretjs/SecretJsFunctions";
import { SecretJsContext } from "../secretjs/SecretJsContext";

import FishTank from "../components/FishTank";
import { FishContextProvider } from "../contexts/fishes";
import { sleep } from "../utils/sleep";

const FishTamagotchiUI = () => {
    const { adopt_fish, feed_fish, query_my_fish, query_all_fish } = SecretJsFunctions();
    const { connectWallet, secretAddress } = useContext(SecretJsContext)!;

    const [allFish, setAllFish] = useState<ShortFishStatus[]>([]);
    const [myFish, setMyFish] = useState<FullFishStatus[] | null>([]);

    const [adoptFishField, setAdoptFishField] = useState("");
    const [tick, setTick] = useState(0)

    const updateTick = async () => {
        await sleep(5)
        setTick((tick + 1) % 3)
    }

    useEffect(() => {
        updateTick()
        if (secretAddress) {
            handle(() => query_my_fish()).catch(() => {})
            handle(() => query_all_fish()).catch(() => {})
        }
    }, [tick])

    const handle = async (fn: () => Promise<any>) => {
        const res = await fn();

        if (res?.all_fish_status) {
            // All fish response
            setAllFish(res.all_fish_status as ShortFishStatus[]);
        } else if (res?.my_fish_status) {
            // My fish response
            setMyFish(res.my_fish_status as FullFishStatus[]);
        } else if (res.code == 3) {
            // An error, pull the message out of the string it gives and show it.
            const rawLog = res.rawLog || "Unknown blockchain error";
            const match = rawLog.match(/Generic error: (.+?)(:|$)/);
            const extracted = match ? match[1] : rawLog;
            console.error(extracted);
        }
    };

    // Get fish status color based on health
    const getFishStatusColor = (fish: FullFishStatus) => {
        if (fish.dead) return '#8B0000';
        if (fish.seconds_since_fed > 120) return '#FF6B35'; // Coral orange
        if (fish.seconds_since_fed > 60) return '#FFD23F'; // Sea foam yellow
        return '#00CED1'; // Dark turquoise
    };

    // Get status text
    const getFishStatusText = (fish: FullFishStatus) => {
        if (fish.dead) return 'Dead';
        if (fish.seconds_since_fed > 120) return 'Starving';
        if (fish.seconds_since_fed > 60) return 'Hunting';
        return 'Swimming';
    };

    useEffect(() => {
        connectWallet();
    }, []);

    return (
        <div style={{ fontFamily: "sans-serif", display: "flex", width: "100vw", minHeight: "100vh" }}>
            {/* Ocean-Themed Side Menu */}
            <div
                style={{
                    width: "280px",
                    background: "rgba(255, 255, 255, 0.1)",
                    color: "#ffffff",
                    padding: "2.5vh",
                    margin: "2.5vh 1rem 2.5vh 1rem",
                    height: "90vh",
                    overflowY: "auto",
                    boxShadow: "inset 0 0 10px rgba(0, 0, 0, 0.3)",
                    borderRadius: "10px",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    backdropFilter: "blur(10px)",
                }}
            >
                <h2 style={{
                    margin: "0 0 25px 0",
                    fontSize: "26px",
                    color: "#FFFFFF",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                    fontWeight: "300",
                    letterSpacing: "1px",
                    textAlign: "center"
                }}>
                    My Fishies
                </h2>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        height: "100%"
                    }}>
                    {myFish && myFish.map((fish) => (
                        <div key={fish.id} style={{
                            backgroundColor: "rgba(255,255,255,0.15)",
                            border: "1px solid rgba(255,255,255,0.25)",
                            borderRadius: "20px",
                            padding: "18px",
                            marginBottom: "18px",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                            backdropFilter: "blur(15px)",
                            transition: "all 0.3s ease",
                            cursor: "pointer"
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.3)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0px)";
                                e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.2)";
                            }}
                        >
                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "12px"
                            }}>
                                <h3 style={{
                                    margin: "0",
                                    fontSize: "18px",
                                    color: "#FFFFFF",
                                    textDecoration: fish.dead ? "line-through" : "none",
                                    textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                                    fontWeight: "400"
                                }}>
                                    🐟 {fish.name}
                                </h3>
                                <span style={{
                                    backgroundColor: getFishStatusColor(fish),
                                    color: "white",
                                    padding: "5px 10px",
                                    borderRadius: "15px",
                                    fontSize: "11px",
                                    fontWeight: "600",
                                    textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                                }}>
                                    {getFishStatusText(fish)}
                                </span>
                            </div>

                            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.9)" }}>
                                <p style={{ margin: "6px 0", display: "flex", alignItems: "center" }}>
                                    <span style={{ minWidth: "60px", opacity: "0.8" }}>⏰</span>
                                    <span>{fish.age}</span>
                                </p>
                                <p style={{ margin: "6px 0", display: "flex", alignItems: "center" }}>
                                    <span style={{ minWidth: "60px", opacity: "0.8" }}>🍽️</span>
                                    <span>{fish.seconds_since_fed}s ago</span>
                                </p>
                                <p style={{ margin: "6px 0", display: "flex", alignItems: "center" }}>
                                    <span style={{ minWidth: "60px", opacity: "0.8" }}>🎨</span>
                                    <span style={{
                                        display: "inline-block",
                                        width: "16px",
                                        height: "16px",
                                        backgroundColor: `#${fish.colour.toString(16).padStart(6, '0')}`,
                                        borderRadius: "50%",
                                        border: "2px solid rgba(255,255,255,0.3)",
                                        marginLeft: "5px"
                                    }}></span>
                                </p>
                            </div>

                            {!fish.dead && (
                                <button
                                    onClick={() => {
                                        handle(() => feed_fish(fish.id));
                                    }}
                                    style={{
                                        backgroundColor: "rgba(0, 206, 209, 0.8)",
                                        color: "white",
                                        border: "none",
                                        padding: "8px 16px",
                                        borderRadius: "25px",
                                        cursor: "pointer",
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        marginTop: "12px",
                                        width: "100%",
                                        transition: "all 0.3s ease",
                                        textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                                        boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = "rgba(0, 206, 209, 1)";
                                        e.currentTarget.style.transform = "translateY(-1px)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = "rgba(0, 206, 209, 0.8)";
                                        e.currentTarget.style.transform = "translateY(0px)";
                                    }}
                                >
                                    🍤 Feed {fish.name}
                                </button>
                            )}
                        </div>
                    ))}
                    {/* Adopt a Fish Section */}
                        { (myFish == null || myFish.length < 5) && <div style={{
                            backgroundColor: "rgba(255,255,255,0.1)",
                            border: "1px solid rgba(255,255,255,0.2)",
                            borderRadius: "15px",
                            padding: "20px",
                            justifySelf: "end",
                            marginTop: myFish == null ? "inherit" : "auto"
                        }}>
                            <h3 style={{
                                margin: "0 0 15px 0",
                                fontSize: "18px",
                                color: "#FFFFFF",
                                textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                                fontWeight: "400",
                                textAlign: "center"
                            }}>
                                🐠 Adopt a Fish
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <input
                                    type="text"
                                    value={adoptFishField}
                                    onChange={(e) => setAdoptFishField(e.target.value)}
                                    style={{
                                        backgroundColor: "rgba(255,255,255,0.2)",
                                        border: "1px solid rgba(255,255,255,0.3)",
                                        borderRadius: "10px",
                                        padding: "8px",
                                        color: "#FFFFFF",
                                        width: "100%",
                                        marginBottom: "10px",
                                        fontSize: "14px",
                                        outline: 'none'
                                    }}
                                    placeholder="Enter fish name..."
                                />
                                <button
                                    onClick={() => handle(() => adopt_fish(adoptFishField))}
                                    disabled={!adoptFishField.trim()}
                                    style={{
                                        backgroundColor: "rgba(0, 206,209,1)",
                                        color: "white",
                                        border: "none",
                                        padding: "8px 16px",
                                        borderRadius: "25px",
                                        cursor: "pointer",
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        width: "100%",
                                        transition: "all 0.3s ease",
                                        textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                                        boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = "rgba(0, 206, 209, 1)";
                                        e.currentTarget.style.transform = "translateY(-1px)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = "rgba(0, 206, 209, 0.8)";
                                        e.currentTarget.style.transform = "translateY(0px)";
                                    }}
                                >
                                    Adopt Fish
                                </button>
                            </div>
                        </div>
}

                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, padding: "1rem" }}>
                <FishContextProvider>
                    <FishTank allFish={allFish} />
                </FishContextProvider>

                {/* Hidden canvas asset */}
                <div style={{ display: "none" }}>
                    <img id="sourceFish" src="fish.png" width="20%" />
                </div>
            </div>
        </div>
    );
};

export default FishTamagotchiUI;