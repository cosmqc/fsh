import { useContext, useEffect, useState, useRef } from "react";
import { SecretJsFunctions } from "../secretjs/SecretJsFunctions";
import type { ShortFishStatus, FullFishStatus, DeadFishStatus } from "../secretjs/SecretJsFunctions";
import { SecretJsContext } from "../secretjs/SecretJsContext";
import { WalletIcon } from "@heroicons/react/24/outline";
import FishTank from "../components/FishTank";
import { FishContextProvider } from "../contexts/fishes";
import { sleep } from "../utils/sleep";
import ErrorPopupProvider, { showError } from '../utils/ErrorPopup';

const CheckmarkIcon = ({ size = 24 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)"
        }}
    >
        <circle
            cx="12"
            cy="12"
            r="10"
            fill="#00FF88"
            stroke="#00FF88"
            strokeWidth="2"
        />
        <path
            d="M9 12L11 14L15 10"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
                animation: "drawTick 0.5s ease-in-out"
            }}
        />
        <style>
            {`
                @keyframes drawTick {
                    0% { stroke-dasharray: 0 10; }
                    100% { stroke-dasharray: 10 0; }
                }
            `}
        </style>
    </svg>
);

const FishTamagotchiUI = () => {
    const { adopt_fish, feed_fish, query_my_fish, query_all_fish, query_dead_fish } = SecretJsFunctions();
    const { connectWallet, secretAddress } = useContext(SecretJsContext)!;

    const [allFish, setAllFish] = useState<ShortFishStatus[]>([]);
    const [myFish, setMyFish] = useState<FullFishStatus[] | null>([]);
    const [deadFish, setDeadFish] = useState<DeadFishStatus[] | null>([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [hoveredFishId, setHoveredFishId] = useState<number | null>(null);
    const hoveredRef = useRef(hoveredFishId)
    
    useEffect(() => {
        hoveredRef.current = hoveredFishId
    }, [hoveredFishId])

    const [adoptFishField, setAdoptFishField] = useState("");
    const [tick, setTick] = useState(0)

    const handleWalletConnection = async () => {
        try {
            await connectWallet();
        } catch (error: any) {
            showError(error.message)
        }
        
    }
    // Connect to the wallet on load
    useEffect(() => {
        handleWalletConnection()
    }, []);

    // Show 'connection success' animation when address changes
    useEffect(() => {
        if (secretAddress) {
            setShowSuccess(true);
            const timer = setTimeout(() => {
                setShowSuccess(false);
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [secretAddress]);

    // Poll contract every five seconds for various types of fish
    const updateTick = async () => {
        await sleep(5)
        setTick((tick + 1) % 3)
    }

    useEffect(() => {
        updateTick()
        if (secretAddress) {
            handle(() => query_my_fish()).catch(() => { })
            handle(() => query_all_fish()).catch(() => { })
            handle(() => query_dead_fish()).catch(() => { })
        }
    }, [tick])

    // Awaits a given function and handles the result 
    const handle = async (fn: () => Promise<any>) => {
        const res = await fn();

        if (res?.all_fish_status) {
            // All fish response
            setAllFish(res.all_fish_status as ShortFishStatus[]);
        } else if (res?.my_fish_status) {
            // My fish response
            setMyFish(res.my_fish_status as FullFishStatus[]);
        } else if (res?.dead_fish_status) {
            setDeadFish(res.dead_fish_status as DeadFishStatus[]);
        } else if (res.code == 3) {
            // An error, pull the message out of the string it gives and show it.
            const rawLog = res.rawLog || "Unknown blockchain error";
            const match = rawLog.match(/Generic error: (.+?)(:|$)/);
            const extracted = match ? match[1] : rawLog;
            showError(extracted)
        }
    };

    // Get fish status color based on hunger
    const getFishStatusColor = (fish: FullFishStatus) => {
        if (fish.dead) return '#303030';
        if (fish.seconds_since_fed > 180) return '#8B0000'; // 3 minutes
        if (fish.seconds_since_fed > 120) return '#FF6B35'; // 2 minutes
        if (fish.seconds_since_fed > 60) return '#FFD23F'; // 1 minute
        return '#00CED1';
    };

    // Get fish status text based on hunger
    const getFishStatusText = (fish: FullFishStatus) => {
        if (fish.dead) return 'Dead';
        if (fish.seconds_since_fed > 180) return 'Dying'; // 3 minutes
        if (fish.seconds_since_fed > 120) return 'Starving'; // 2 minutes
        if (fish.seconds_since_fed > 60) return 'Hungry'; // 1 minute
        return 'Swimming';
    };

    // Helper function to format time since fed
    const formatTimeSinceFed = (seconds: number) => {
        if (seconds < 60) {
            return `${seconds}s ago`;
        } else if (seconds < 3600) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return `${minutes}m ${remainingSeconds}s ago`;
        } else {
            const hours = Math.floor(seconds / 3600);
            const remainingMinutes = Math.floor((seconds % 3600) / 60);
            return `${hours}h ${remainingMinutes}m ago`;
        }
    };

    return (
        <div style={{ fontFamily: "sans-serif", display: "flex", width: "100vw", minHeight: "100vh", position: "relative" }}>
            {/* Floating Wallet Button */}
            <button
                onClick={handleWalletConnection}
                style={{
                    position: "fixed",
                    top: "20px",
                    right: "20px",
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    backgroundColor: showSuccess ? "rgba(0, 255, 136, 0.9)" : "rgba(0, 206, 209, 0.9)",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    color: "white",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                    backdropFilter: "blur(10px)",
                    transition: "all 0.3s ease",
                    zIndex: 10,
                    outline: "none",
                }}
                onMouseEnter={(e) => {
                    if (!showSuccess) {
                        e.currentTarget.style.backgroundColor = "rgba(0, 206, 209, 1)";
                        e.currentTarget.style.transform = "translateY(-2px) scale(1.05)";
                        e.currentTarget.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.4)";
                    }
                }}
                onMouseLeave={(e) => {
                    if (!showSuccess) {
                        e.currentTarget.style.backgroundColor = "rgba(0, 206, 209, 0.9)";
                        e.currentTarget.style.transform = "translateY(0px) scale(1)";
                        e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.3)";
                    }
                }}
                title={showSuccess ? "Wallet Connected!" : "Connect Wallet"}
            >
                {showSuccess ? (
                    <CheckmarkIcon size={32} />
                ) : (
                    <WalletIcon
                        style={{
                            width: "28px",
                            height: "28px",
                            strokeWidth: "2"
                        }}
                    />
                )}
            </button>

            {/* Side Menu */}
            <div
                style={{
                    width: "280px",
                    background: "rgba(255, 255, 255, 0.1)",
                    color: "#ffffff",
                    padding: "2.5vh",
                    margin: "2.5vh 1rem 2.5vh 1rem",
                    height: "90vh",
                    boxShadow: "inset 0 0 10px rgba(0, 0, 0, 0.3)",
                    borderRadius: "10px",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    backdropFilter: "blur(10px)",
                    zIndex: 2,
                }}
            >
                <h2 style={{
                    margin: "0 0 25px 0",
                    fontSize: "26px",
                    color: "#FFFFFF",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
                    fontWeight: "300",
                    letterSpacing: "1px",
                    textAlign: "center"
                }}>
                    My Fishies
                </h2>

                {/* List of fish that can scroll if overflows */}
                <div style={{
                    flex: 1,
                    overflowY: "auto",
                    paddingTop: "10px",
                    marginBottom: "20px",
                    paddingRight: "5px",
                    background: "none"
                }}>
                    {myFish && myFish.sort(
                        (a, b) => Number(a.dead) - Number(b.dead)
                    ).map((fish) => (
                        <div key={fish.id} style={{
                            backgroundColor: "rgba(255,255,255,0.15)",
                            border: "1px solid rgba(255,255,255,0.25)",
                            borderRadius: "20px",
                            padding: "18px",
                            marginBottom: "18px",
                            backdropFilter: "blur(15px)",
                            transition: "all 0.3s ease",
                            cursor: "pointer"
                        }}
                            onMouseEnter={(e) => {
                                setHoveredFishId(fish.id);
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 6px 6px rgba(0,0,0,0.1)";
                            }}
                            onMouseLeave={(e) => {
                                setHoveredFishId(null);
                                e.currentTarget.style.transform = "translateY(0px)";
                                e.currentTarget.style.boxShadow = "none";
                            }}
                        >
                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "12px"
                            }}>
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px"
                                }}>
                                    <img
                                        src="/fish.png"
                                        alt="Fish"
                                        style={{
                                            height: "24px",
                                            filter: `hue-rotate(${fish.colour}deg)`
                                        }}
                                    />
                                    <h3 style={{
                                        margin: "0",
                                        fontSize: "18px",
                                        color: "#FFFFFF",
                                        textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                                        fontWeight: "400",
                                        maxWidth: "100px",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis"
                                    }}>
                                        {fish.name}
                                    </h3>
                                </div>
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

                            {!fish.dead && (
                                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.9)" }}>
                                    <p style={{ margin: "6px 0", display: "flex", alignItems: "center" }}>
                                        <span style={{ minWidth: "60px", opacity: "0.7", fontSize: "11px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.5px" }}>Age</span>
                                        <span>{formatTimeSinceFed(fish.age)}</span>
                                    </p>
                                    <p style={{ margin: "6px 0", display: "flex", alignItems: "center" }}>
                                        <span style={{ minWidth: "60px", opacity: "0.7", fontSize: "11px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.5px" }}>Fed</span>
                                        <span>{formatTimeSinceFed(fish.seconds_since_fed)}</span>
                                    </p>
                                </div>
                            )}

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
                                        boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
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
                                    {(getFishStatusText(fish) === 'Dying' ? '🪦 Bury ' : '🍽️ Feed ')}
                                    <span style={{
                                        display: "inline-block",
                                        maxWidth: "100px",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        verticalAlign: "middle",
                                        padding: "2px 0"
                                    }}>
                                        {fish.name}
                                    </span>
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Adopt Fish Section */}
                {(myFish == null || myFish.filter((fish) => !fish.dead).length < 10) && (
                    <div style={{
                        backgroundColor: "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "15px",
                        padding: "20px",
                        flexShrink: 0
                    }}>
                        <h3 style={{
                            margin: "0 0 15px 0",
                            fontSize: "18px",
                            color: "#FFFFFF",
                            textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                            fontWeight: "400",
                            textAlign: "center"
                        }}>
                            Adopt a Fish
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
                                onClick={() => {
                                    handle(() => adopt_fish(adoptFishField))
                                    setAdoptFishField('')
                                }}
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
                )}
            </div>

            {/* Fish tank and accessories */}
            <div style={{ flex: 1, padding: "1rem" }}>
                <FishContextProvider>
                    <FishTank allFish={allFish} hoveredFishId={hoveredFishId} />
                </FishContextProvider>
                {/* Gravestones container */}
                <div style={{
                    position: "fixed",
                    bottom: "2vh",
                    left: 0,
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    gap: "20px",
                    pointerEvents: "none",
                    zIndex: 9,
                    opacity: 0.8
                }}>
                    {deadFish && deadFish.map((fish) => (
                        <div key={fish.id} style={{ position: "relative", pointerEvents: "auto" }}>
                            
                            {/* Gravestone */}
                            <div
                                style={{
                                    width: "40px",
                                    height: "60px",
                                    background: "linear-gradient(145deg, #666, #444)",
                                    borderRadius: "15px 15px 5px 5px",
                                    boxShadow: `
                                        inset 0 2px 4px rgba(255,255,255,0.1),
                                        inset 0 -2px 4px rgba(0,0,0,0.3),
                                        0 8px 16px rgba(0,0,0,0.4),
                                        0 0 0 2px #333
                                        `,
                                    cursor: "default",
                                    letterSpacing: "1px",
                                    color: "#E0E0E0",
                                    padding: "8px",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    position: "relative",
                                    border: "1px solid #777"
                                }}
                                onMouseEnter={(e) => {
                                    const tooltip = e.currentTarget.nextSibling as HTMLDivElement;
                                    tooltip.style.opacity = "1";
                                }}
                                onMouseLeave={(e) => {
                                    const tooltip = e.currentTarget.nextSibling as HTMLDivElement;
                                    tooltip.style.opacity = "0";
                                }}
                            >
                                RIP
                                <img src="/fish.png" alt="Fish" width="32px" style={{
                                    marginTop: "5px",
                                    filter: `hue-rotate(${fish.colour}deg)`
                                }} /></div>

                            {/* Gravestone popup */}
                            < div style={{
                                position: "absolute",
                                bottom: "90px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                background: "rgba(0,0,0,0.7)",
                                color: "white",
                                padding: "8px 12px",
                                borderRadius: "6px",
                                fontSize: "12px",
                                whiteSpace: "nowrap",
                                opacity: "0",
                                transition: "opacity 0.3s ease",
                                pointerEvents: "none",
                                boxShadow: "0 12px 12px rgba(0,0,0,0.1)",
                                border: "1px solid #555",
                            }}>
                                <div style={{ fontWeight: "bold", marginBottom: "5px" }}>🪦 RIP</div>
                                <div>{fish.name}</div>
                                <div style={{ fontSize: "10px", opacity: 0.7 }}>Owner: {fish.owner}</div>
                                <img src="/fish.png" alt="Fish" width="32px" style={{
                                    marginTop: "5px",
                                    filter: `hue-rotate(${fish.colour}deg)`
                                }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div >

            <ErrorPopupProvider />
        </div >
    );

};

export default FishTamagotchiUI;