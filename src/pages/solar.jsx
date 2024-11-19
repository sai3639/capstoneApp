import React, { useEffect, useState } from "react";
import Panel from '../models/panel.jsx';
import { Canvas } from "@react-three/fiber";
import { Line } from "react-chartjs-2";
import axios from 'axios';
import { saveAs } from 'file-saver';
import { OrbitControls } from "@react-three/drei";

const styles = {
    container: {
        background: "linear-gradient(to bottom, #0a0f1f, #1a237e, #0a0f1f)",
        color: "#ffffff",
        minHeight: "100vh",
        padding: "2rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
    },
    header: {
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        marginBottom: "2rem",
    },
    title: {
        fontSize: "2.5rem",
        fontWeight: "bold",
        margin: 0,
        background: "linear-gradient(to right, #ffd700, #ff8c00)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
    },
    mainContent: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "2rem",
        maxWidth: "1800px",
        margin: "0 auto",
    },
    dataSection: {
        background: "rgba(13, 18, 38, 0.7)",
        backdropFilter: "blur(10px)",
        borderRadius: "1rem",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        padding: "1.5rem",
        height: "fit-content",
    },
    button: {
        background: "linear-gradient(135deg, #ffd700, #ff8c00)",
        color: "#000",
        border: "none",
        borderRadius: "0.5rem",
        padding: "0.75rem 1.5rem",
        fontSize: "1rem",
        fontWeight: "bold",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        transition: "transform 0.2s ease",
        marginBottom: "1.5rem",
    },
    chartContainer: {
        background: "rgba(13, 18, 38, 0.5)",
        borderRadius: "0.75rem",
        padding: "1rem",
        marginBottom: "2rem",
    },
    tableContainer: {
        maxHeight: "400px",
        overflowY: "auto",
        background: "rgba(13, 18, 38, 0.5)",
        borderRadius: "0.75rem",
        padding: "1rem",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "0.9rem",
    },
    th: {
        padding: "1rem",
        textAlign: "left",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        color: "#ffd700",
    },
    td: {
        padding: "0.75rem 1rem",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    },
    canvasContainer: {
        background: "rgba(13, 18, 38, 0.7)",
        backdropFilter: "blur(10px)",
        borderRadius: "1rem",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        overflow: "hidden",
        height: "800px",
    },
    loadingContainer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        padding: "2rem",
    }
};

const Solar = () => {
    const [powerData, setPowerData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPowerData = async () => {
            try {
                const response = await axios.get("http://localhost:8888/power");
                if (response.data && response.data.powerData) {
                    setPowerData(response.data.powerData);
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error fetching power data:", error);
            }
        };

        fetchPowerData();
    }, []);

    const downloadCSV = () => {
        const csvHeader = ["ID,Message,Watts (W),Timestamp\n"];
        const csvRows = powerData.map(record =>
            `${record.id},${record.message},${record.watt},${record.created_at}`
        );
        const csvString = [csvHeader, ...csvRows].join("\n");
        const blob = new Blob([csvString], { type: "text/csv" });
        saveAs(blob, "powerData.csv");
    };

    const chartData = {
        labels: powerData.map((record) => record.created_at),
        datasets: [
            {
                label: "Power Output (W)",
                data: powerData.map((record) => record.watt),
                fill: true,
                backgroundColor: "rgba(255, 215, 0, 0.2)",
                borderColor: "#ffd700",
                tension: 0.4,
                pointBackgroundColor: "#ff8c00",
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: "#ffffff"
                }
            }
        },
        scales: {
            y: {
                grid: {
                    color: "rgba(255, 255, 255, 0.1)"
                },
                ticks: {
                    color: "#ffffff"
                }
            },
            x: {
                grid: {
                    color: "rgba(255, 255, 255, 0.1)"
                },
                ticks: {
                    color: "#ffffff"
                }
            }
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Solar Panel Wattage</h1>
            </div>

            <div style={styles.mainContent}>
                <div style={styles.dataSection}>
                    <button
                        style={styles.button}
                        onClick={downloadCSV}
                    >
                        Export Data
                    </button>

                    {loading ? (
                        <div style={styles.loadingContainer}>
                            <span>Loading telemetry data...</span>
                        </div>
                    ) : (
                        <>
                            <div style={styles.chartContainer}>
                                <div style={{ height: "400px" }}>
                                    <Line data={chartData} options={chartOptions} />
                                </div>
                            </div>

                            <div style={styles.tableContainer}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>ID</th>
                                            <th style={styles.th}>Message</th>
                                            <th style={styles.th}>Watts (W)</th>
                                            <th style={styles.th}>Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {powerData.map((record) => (
                                            <tr key={record.id}>
                                                <td style={styles.td}>{record.id}</td>
                                                <td style={styles.td}>{record.message}</td>
                                                <td style={styles.td}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        {record.watt}
                                                    </div>
                                                </td>
                                                <td style={styles.td}>{record.created_at}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>

                <div style={styles.canvasContainer}>
                    <Canvas>
                        <directionalLight position={[2, 2, 7]} intensity={0.7} />
                        <ambientLight intensity={0.3} />
                        <Panel />
                        <OrbitControls />
                    </Canvas>
                </div>
            </div>
        </div>
    );
};

export default Solar;