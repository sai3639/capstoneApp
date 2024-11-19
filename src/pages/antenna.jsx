import React, { useEffect, useState } from "react";

const styles = {
    container: {
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #0f172a, #1e3a8a, #0f172a)",
        color: "#e2e8f0",
        padding: "2rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
    },
    contentWrapper: {
        maxWidth: "1200px",
        margin: "0 auto",
    },
    header: {
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        marginBottom: "2rem",
    },
    title: {
        fontSize: "2rem",
        fontWeight: "bold",
        background: "linear-gradient(to right, #60a5fa, #a78bfa)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        margin: 0,
    },
    card: {
        background: "rgba(17, 24, 39, 0.7)",
        backdropFilter: "blur(10px)",
        borderRadius: "0.75rem",
        border: "1px solid rgba(55, 65, 81, 0.5)",
        padding: "1.5rem",
        marginBottom: "2rem",
    },
    select: {
        background: "#1f2937",
        color: "#e2e8f0",
        padding: "0.5rem 1rem",
        borderRadius: "0.5rem",
        border: "1px solid rgba(75, 85, 99, 0.5)",
        marginLeft: "1rem",
        fontSize: "1rem",
        cursor: "pointer",
    },
    textarea: {
        width: "100%",
        background: "#1f2937",
        color: "#e2e8f0",
        padding: "0.75rem",
        borderRadius: "0.5rem",
        border: "1px solid rgba(75, 85, 99, 0.5)",
        marginBottom: "1rem",
        fontSize: "1rem",
        resize: "vertical",
        minHeight: "100px",
    },
    button: {
        background: "#3b82f6",
        color: "white",
        padding: "0.75rem 1.5rem",
        borderRadius: "0.5rem",
        border: "none",
        fontSize: "1rem",
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
    logsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "1.5rem",
        margin: "2rem 0",
    },
    logCard: {
        background: "rgba(17, 24, 39, 0.7)",
        backdropFilter: "blur(10px)",
        borderRadius: "0.75rem",
        border: "1px solid rgba(55, 65, 81, 0.5)",
        padding: "1.5rem",
        transition: "all 0.3s ease",
        position: "relative",
        overflow: "hidden",
    },
    logHeader: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        marginBottom: "1rem",
    },
    callsign: {
        color: "#60a5fa",
        fontWeight: "bold",
        fontSize: "1.1rem",
    },
    logContent: {
        color: "#d1d5db",
        marginBottom: "1rem",
        lineHeight: "1.5",
    },
    timestamp: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        color: "#9ca3af",
        fontSize: "0.875rem",
    },
    icon: {
        color: "#60a5fa",
    },
    noLogs: {
        textAlign: "center",
        padding: "2rem",
        color: "#9ca3af",
        gridColumn: "1 / -1",
    },
};

// Add hover effects
const hoverStyles = {
    button: {
        ...styles.button,
        ":hover": {
            background: "#2563eb",
            transform: "translateY(-2px)",
        },
    },
    logCard: {
        ...styles.logCard,
        ":hover": {
            borderColor: "#60a5fa",
            transform: "translateY(-2px)",
        },
    },
};

const Antenna = ({ userType, callsign }) => {
    const [telemetryData, setTelemetryData] = useState("");
    const [logs, setLogs] = useState([]);
    const [selectedCallsign, setSelectedCallsign] = useState(callsign || "");
    const [filteredLogs, setFilteredLogs] = useState([]);

    const fetchLogs = async () => {
        try {
            const response = await fetch("http://localhost:8888/logs");
            const data = await response.json();
            setLogs(data);
            
            if (selectedCallsign) {
                const filtered = data.filter(log => log.callsign === selectedCallsign);
                setFilteredLogs(filtered);
            } else {
                setFilteredLogs(data);
            }
        } catch (error) {
            console.error("Error fetching logs:", error);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [selectedCallsign]);

    const handleLogSubmit = async () => {
        if (userType === "guest") {
            alert("Guest users are not allowed to add logs");
            return;
        }

        try {
            const response = await fetch("http://localhost:8888/add-log", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ callsign: selectedCallsign, telemetry_data: telemetryData }),
            });
            const data = await response.json();

            if (data.success) {
                alert(data.message);
                setTelemetryData("");
                fetchLogs();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Error submitting log:", error);
        }
    };

    const uniqueCallsigns = [...new Set(logs.map((log) => log.callsign))];

    return (
        <div style={styles.container}>
            <div style={styles.contentWrapper}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Space Telemetry Log</h2>
                </div>

                <div style={styles.card}>
                    <div style={styles.logHeader}>
                        <select
                            value={selectedCallsign}
                            onChange={(e) => setSelectedCallsign(e.target.value)}
                            style={styles.select}
                        >
                            {uniqueCallsigns.map((call, index) => (
                                <option key={index} value={call}>
                                    {call}
                                </option>
                            ))}
                        </select>
                    </div>

                    {userType === "authenticated" && (
                        <div>
                            <textarea
                                style={styles.textarea}
                                placeholder="Enter telemetry data..."
                                value={telemetryData}
                                onChange={(e) => setTelemetryData(e.target.value)}
                            />
                            <button
                                onClick={handleLogSubmit}
                                style={hoverStyles.button}
                            >
                                Submit Log
                            </button>
                        </div>
                    )}
                </div>

                <h3 style={{ ...styles.title, fontSize: "1.5rem" }}>
                    Transmission Logs: {selectedCallsign}
                </h3>

                <div style={styles.logsGrid}>
                    {filteredLogs.length > 0 ? (
                        filteredLogs.map((log, index) => (
                            <div key={index} style={hoverStyles.logCard}>
                                <div style={styles.logHeader}>
                                    <span style={styles.callsign}>{log.callsign}</span>
                                </div>
                                <p style={styles.logContent}>{log.telemetry_data}</p>
                                <div style={styles.timestamp}>
                                    <span>{new Date(log.created_at).toLocaleString()}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={styles.noLogs}>
                            No transmission logs available
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Antenna;
