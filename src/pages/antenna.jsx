import React, { useEffect, useState } from "react";

const styles = {
    container: {
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #0f172a, #1e3a8a, #0f172a)",
        color: "#e2e8f0",
        padding: "4rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
    },
    contentWrapper: {
        maxWidth: "1400px",
        margin: "0 auto",
    },
    header: {
        display: "flex",
        alignItems: "center",
        gap: "2rem",
        marginBottom: "4rem",
    },
    title: {
        fontSize: "4rem",
        fontWeight: "bold",
        background: "linear-gradient(to right, #60a5fa, #a78bfa)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        margin: 0,
    },
    card: {
        background: "rgba(17, 24, 39, 0.7)",
        backdropFilter: "blur(10px)",
        borderRadius: "1rem",
        border: "1px solid rgba(55, 65, 81, 0.5)",
        padding: "3rem",
        marginBottom: "3rem",
    },
    select: {
        background: "#1f2937",
        color: "#e2e8f0",
        padding: "1rem 1.5rem",
        borderRadius: "0.5rem",
        border: "1px solid rgba(75, 85, 99, 0.5)",
        marginLeft: "1rem",
        fontSize: "1.5rem",
        cursor: "pointer",
    },
    textarea: {
        width: "100%",
        background: "#1f2937",
        color: "#e2e8f0",
        padding: "1.5rem",
        borderRadius: "0.5rem",
        border: "1px solid rgba(75, 85, 99, 0.5)",
        marginBottom: "1.5rem",
        fontSize: "1.25rem",
        resize: "vertical",
        minHeight: "200px",
    },
    button: {
        background: "#3b82f6",
        color: "white",
        padding: "1.5rem 3rem",
        borderRadius: "0.5rem",
        border: "none",
        fontSize: "1.5rem",
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
    commandTable: {
        width: "100%",
        borderCollapse: "collapse",
        marginTop: "3rem",
        fontSize: "1.25rem",
    },
    tableHeader: {
        background: "rgba(17, 24, 39, 0.7)",
        color: "#60a5fa",
        fontWeight: "bold",
    },
    tableCell: {
        border: "1px solid rgba(75, 85, 99, 0.5)",
        padding: "1.5rem",
        textAlign: "left",
    },
    logsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "2em",
        margin: "3rem 0",
    },
    logCard: {
        background: "rgba(17, 24, 39, 0.7)",
        backdropFilter: "blur(10px)",
        borderRadius: "1rem",
        border: "1px solid rgba(55, 65, 81, 0.5)",
        padding: "2rem",
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
        fontSize: "1.5rem",
    },
    logContent: {
        color: "#d1d5db",
        marginBottom: "1.5rem",
        lineHeight: "1.5",
    },
    timestamp: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        color: "#9ca3af",
        fontSize: "1rem",
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
    const [activeCommand, setActiveCommand] = useState(null);
    const [sessionStatus, setSessionStatus] = useState(null);
  
    const commandTable = [
      { command: "Deploy Antenna", description: "Unfold antennas on CubeSat" },
      { command: "Ping CubeSat", description: "Send diagnostic ping to verify CubeSat communication status" }
    ];
  
    const fetchLogs = async () => {
      try {
        const response = await fetch("http://localhost:8888/logs", { 
          credentials: "include" // for sending cookies 
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
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
        alert(`Failed to fetch logs: ${error.message}`);
      }
    };
  
    const verifySession = async () => {
      try {
        const response = await fetch("http://localhost:8888/verify-session", {
          method: 'GET',
          credentials: "include" // for sending cookies
        });
        
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
        
        if (data.success) {
          setSelectedCallsign(data.callsign);
          setSessionStatus("valid");
          console.log("Session is valid for callsign:", data.callsign);
          fetchLogs(); // Automatically fetch logs after successful session verification
        } else {
          setSessionStatus("invalid");
          console.log("Session invalid. Please log in again.");
          // redirect to login page or show login modal
          navigate('/login');

        }
      } catch (error) {
        console.error("Error verifying session:", error);
        setSessionStatus("error");
        alert(`Session verification failed: ${error.message}`);
      }
    };
  
    useEffect(() => {
      verifySession();
    }, []);
  
    const handleLogSubmit = async () => {
      if (userType === "guest" || sessionStatus !== "valid") {
        alert("Unable to add log. Please check your session and user type.");
        return;
      }
  
      try {
        const response = await fetch("http://localhost:8888/add-log", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ 
            callsign: selectedCallsign, 
            telemetry_data: telemetryData 
          })
        });
  
        const data = await response.json();
        
        if (response.ok && data.success) {
          alert(data.message);
          setTelemetryData("");
          fetchLogs(); // Refresh logs after successful submission
        } else {
          alert(data.message || "Failed to add log");
        }
      } catch (error) {
        console.error("Error submitting log:", error);
        alert(`Error submitting log: ${error.message}`);
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
                    <h3 style={{...styles.title, fontSize: "2rem", marginBottom: "1.5rem"}}>
                        Available Commands
                    </h3>
                    <table style={styles.commandTable}>
                        <thead>
                            <tr style={styles.tableHeader}>
                                <th style={styles.tableCell}>Command</th>
                                <th style={styles.tableCell}>Description</th>
                          
                            </tr>
                        </thead>
                        <tbody>
                            {commandTable.map((cmd, index) => (
                                <tr key={index}>
                                    <td style={styles.tableCell}>{cmd.command}</td>
                                    <td style={styles.tableCell}>{cmd.description}</td>
                                   
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
