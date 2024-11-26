import React, { useEffect, useState } from "react";
import Panel from '../models/panel.jsx';
import { Canvas } from "@react-three/fiber";
import { Line } from "react-chartjs-2";
import axios from 'axios';
import { saveAs } from 'file-saver';
import { OrbitControls } from "@react-three/drei";
import { Link } from "react-router-dom";
import 'chart.js/auto';

const Solar = () => {
    const [powerData, setPowerData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeAlert, setActiveAlert] = useState(null); // Tracks active alert


    const adjustPanelForScreenSize = () => {
        let screenScale = null;  
        let screenPosition = [-2, 3, -3]
        let rotation = [-2, -0.5, 1]
    
        if(window.innerWidth < 768){
            screenScale = [8, 8, 8];
        }
        else{
            screenScale = [8, 8, 8];
        }
    
        return [screenScale, screenPosition, rotation];
    }
    
    const [panelScale, panelPosition, panelRotation] = adjustPanelForScreenSize();

    const sampleData = (data, maxPoints) => {
        if (data.length <= maxPoints) return data;
        const step = Math.ceil(data.length / maxPoints);
        return data.filter((_, index) => index % step === 0);
    };

    useEffect(() => {
        const fetchPowerData = async () => {
            try {


                await axios.post('http://localhost:8888/add-power');
                const response = await axios.get("http://localhost:8888/power");

                if (response.data && response.data.powerData) {
                    const data = response.data.powerData;

                    // Check watt conditions
                    let alertMessage = null;

                    if (data.length > 0) {
                        const latestRecord = data[data.length - 1];

                        if (typeof latestRecord.watt !== 'number' || isNaN(latestRecord.watt)) {
                            alertMessage = 'Error: Non-readable power value detected!';
                        } else if (latestRecord.watt < 5) {
                            alertMessage = 'Power too low!';
                        } else if (latestRecord.watt > 20) {
                            alertMessage = 'Power too high!';
                        }

                        // Set alert if a condition is met
                        if (alertMessage) {
                            setActiveAlert(alertMessage);
                        }
                    }

                    setPowerData(data);
                } else {
                    throw new Error('No power data received');
                }
            } catch (error) {
                console.error("Error fetching power data:", error);
                setError(error.message);
                setActiveAlert('Error fetching power data');
            } finally {
                setLoading(false);
            }
        };

        fetchPowerData();
    }, []); // Trigger only on mount

    const handleAlertClose = () => {
        setActiveAlert(null);
    };

    const AlertModal = ({ message, onClose }) => (
        <div className="alert-overlay">
            <div className="alert-modal">
                <div className="alert-content">
                    <p>{message}</p>
                    <button onClick={onClose}>Dismiss</button>
                </div>
            </div>
        </div>
    );

    const downloadCSV = () => {
        const csvHeader = ["ID,Message,Watts (W),Timestamp\n"];
        const csvRows = powerData.map(record =>
            `${record.id},${record.message},${record.watt},${record.created_at}`
        );
        const csvString = [csvHeader, ...csvRows].join("\n");
        const blob = new Blob([csvString], { type: "text/csv" });
        saveAs(blob, "powerData.csv");
    };

    if (loading) return <div className="loading">Loading Solar Data...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    //limit number of points in chart
    const maxPoints = 50; 
    const sampledData = sampleData(powerData, maxPoints);

    // Prepare chart data
    const chartData = {
        labels: sampledData.map(data => new Date(data.created_at).toLocaleString()),
        datasets: [{
            label: 'Power Output (W)',
            data: sampledData.map(data => data.watt),
            borderColor: '#00ffff', 
            backgroundColor: 'rgba(0, 255, 255, 0.2)',
            fill: true,
            tension: 0.4,
        }],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: '#e0e0e0', // Light grey text
                    font: {
                        size: 45 // font size for legend 
                    }
                }
            }
        },
        scales: {
            x: {
                title: { 
                    display: true, 
                    text: 'Date/Time',
                    color: '#00ffff', // Cyan title
                    font: {
                        size: 40 // title font size 
                    }
                },
                ticks: {
                    color: '#e0e0e0', // Light grey ticks
                    font: {
                        size: 30 // tick font size
                    }
                },
                grid: {
                    color: 'rgba(255,255,255,0.1)' // grid lines
                }
            },
            y: {
                title: { 
                    display: true, 
                    text: 'Power Output (W)',
                    color: '#00ffff', // Cyan title
                    font: {
                        size: 40 // title font size 
                    }
                },
                ticks: {
                    color: '#e0e0e0', // Light grey ticks
                    font: {
                        size: 30 // tick font size
                    }
                },
                beginAtZero: true,
                grid: {
                    color: 'rgba(255,255,255,0.1)' // Subtle grid lines
                }
            }
        }
    };

    return (
        <div className="power-container">
             <Link to="/Home" className="back-button">
              
                Back to Home
            </Link>
                     {activeAlert && (
                <AlertModal 
                message={activeAlert} 
                onClose={handleAlertClose} 
            />
        )}
            <div className="left-section">
                <div className="chart-section">
                    <h2 className="chart-title">Power Output Trajectory</h2>
                    <div className="chart-container">
                        <Line data={chartData} options={options} />
                    </div>
                </div>

                <div className="battery-section">
                    <Canvas className="battery-canvas">
                        <ambientLight intensity={0.5} />
                        <directionalLight position={[15, -5, 1]} intensity={0.5} />
                        <directionalLight position={[4, -5, 1]} intensity={0.5} />
                        <directionalLight position={[4, -3, 1]} intensity={0.5} />

                        <Panel 
                            position={panelPosition}
                            scale={panelScale}
                            rotation={panelRotation}
                        />
                        <OrbitControls/>
                    </Canvas>
                </div>
            </div>

            <div className="right-section">
                <h1 className="page-title">Solar Systems Monitor</h1>
                <div className="table-container">
                    <table className="voltage-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Message</th>
                                <th>Watts</th>
                                <th>Date/Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {powerData.map((data) => (
                                <tr key={data.id}>
                                    <td>{data.id}</td>
                                    <td>{data.message}</td>
                                    <td>{data.watt} W</td>
                                    <td>{new Date(data.created_at).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                body {
                    background-color: #0a192f;
                    color: #e0e0e0;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
                                'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 
                                'Helvetica Neue', sans-serif;
                }

                  .alert-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }

                .alert-modal {
                    background-color: #1a2b3c;
                    border: 2px solid #00ffff;
                    border-radius: 8px;
                    padding: 40px;
                    max-width: 600px;
                    width: 90%;
                    text-align: center;
                }

                .alert-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .alert-content p {
                    margin-bottom: 20px;
                    color: #00ffff;
                    font-size: 1.5rem;
                }

                .alert-content button {
                    background-color: #00ffff;
                    color: #0a192f;
                    border: none;
                    padding:20px 30px;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                }

                .alert-content button:hover {
                    background-color: #80ffff;
                }

                       .back-button {
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    display: flex;
                    align-items: center;
                    color: #00ffff;
                    text-decoration: none;
                    font-size: 1rem;
                    background-color: rgba(0,255,255,0.1);
                    border: 1px solid #00ffff;
                    padding: 10px 15px;
                    border-radius: 4px;
                    transition: background-color 0.3s ease;
                    z-index: 100;
                    
                }

                .back-button svg {
                    margin-right: 10px;
                    stroke: #00ffff;
                }

                .back-button:hover {
                    background-color: rgba(0,255,255,0.2);
                }

                @media (max-width: 768px) {
                    .back-button {
                        position: relative;
                        top: 0;
                        left: 0;
                        margin-bottom: 20px;
                    }
                }


                .power-container {
                    display: flex;
                    padding: 20px;
                    background-color: #0a192f;
                    color: #e0e0e0;
                    height: calc(100vh - 40px);
                }

                .left-section {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    margin-right: 20px;
                }

                .right-section {
                    width: 40%;
                    display: flex;
                    flex-direction: column;
                }

                .page-title {
                    font-size: 2.5rem;
                    color: #00ffff;
                    margin-bottom: 20px;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    font-weight: bold;
                    text-align: center;
                }

                .chart-section {
                    flex: 1;
                    margin-bottom: 20px;
                }

                .chart-title {
                    font-size: 1.8rem;
                    color: #00ffff;
                    margin-bottom: 20px;
                    font-weight: bold;
                }

                .chart-container {
                    height: 50%;
                    width: 100%;
                }

                .battery-section {
                    flex: 1;
                }

                .battery-canvas {
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0,0,0,0.3);
                    border-radius: 8px;
                }

                .table-container {
                    flex: 1;
                    overflow-y: auto;
                    border: 2px solid #00ffff;
                    background-color: rgba(0,0,0,0.5);
                    border-radius: 8px;
                }

                .voltage-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 2rem;
                }

                .voltage-table thead {
                    background-color: #1a2b3c;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }

                .voltage-table th, .voltage-table td {
                    border: 1px solid #00ffff;
                    padding: 16px; 
                    text-align: left;
                    font-size: 2rem; 
                }

                .voltage-table tr:nth-child(even) {
                    background-color: rgba(0,255,255,0.05);
                }

                .loading, .error {
                    color: #00ffff;
                    font-size: 2rem;
                    text-align: center;
                    margin-top: 50px;
                }

                @media (max-width: 768px) {
                    .power-container {
                        flex-direction: column;
                        height: auto;
                    }

                    .left-section, .right-section {
                        width: 100%;
                        margin-right: 0;
                    }

                    .chart-container, .battery-canvas {
                        height: 300px;
                    }

                    .voltage-table {
                        font-size: 0.9rem;
                    }

                    .voltage-table th, .voltage-table td {
                        padding: 8px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Solar;