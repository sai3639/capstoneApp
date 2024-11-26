import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Canvas } from '@react-three/fiber';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import Batteries from '../models/batteries.jsx';
import { OrbitControls } from "@react-three/drei";
import { useNavigate } from 'react-router-dom';  

const Power = () => {
    const [voltageData, setVoltageData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeAlert, setActiveAlert] = useState(null); // Tracks active alert
    const navigate = useNavigate();
    const adjustBatteriesForScreenSize = () => {
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
    
    const [batteriesScale, batteriesPosition, batteriesRotation] = adjustBatteriesForScreenSize();

    const sampleData = (data, maxPoints) => {
        if (data.length <= maxPoints) return data;
        const step = Math.ceil(data.length / maxPoints);
        return data.filter((_, index) => index % step === 0);
    };
    

    useEffect(() => {
        const fetchVoltageData = async () => {
            try {
                // Always add a new voltage reading on page load
                await axios.post('http://localhost:8888/add-voltage');
    
                // Fetch updated voltage data
                const response = await axios.get('http://localhost:8888/voltages');
                const data = response.data.voltageData;
    
                // checks voltage conditions
                let alertMessage = null;
    
                if (data && data.length > 0) {
                    const latestRecord = data[data.length - 1];
    
                    if (typeof latestRecord.volt !== 'number' || isNaN(latestRecord.volt)) {
                        alertMessage = 'Error: Non-readable voltage detected!';
                    } else if (latestRecord.volt < 5) {
                        alertMessage = 'Voltage too low!';
                    } else if (latestRecord.volt > 10) {
                        alertMessage = 'Voltage too high!';
                    }
    
                    // Set alert if a condition is met
                    if (alertMessage) {
                        setActiveAlert(alertMessage);
                    }
                }
    
                setVoltageData(data);
            } catch (err) {
                setError(err.message);
                setActiveAlert('Error fetching voltage data');
            } finally {
                setLoading(false);
            }
        };
    
        // Fetch data immediately on page load
        fetchVoltageData();
    
        // Optional: Set up a simple data fetch without adding new voltage
        const intervalId = setInterval(() => {
            const fetchData = async () => {
                try {
                    const response = await axios.get('http://localhost:8888/voltages');
                    setVoltageData(response.data.voltageData);
                } catch (err) {
                    setError(err.message);
                }
            };
            fetchData();
        }, 5000);
    
        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
    }, []); // Empty dependency array to trigger only on mount
    const handleAlertClose = () => {
        setActiveAlert(null);
    }

    // Alert component for better styling and functionality

const AlertModal = ({ message, onClose }) => {
    return (
        <div className="alert-overlay">
            <div className="alert-modal">
                <div className="alert-content">
                    <div className="alert-header">
                        <h3>System Alert</h3>
                        <button className="close-button" onClick={onClose}>×</button>
                    </div>
                    <div className="alert-body">
                        <p>{message}</p>
                    </div>
                    <div className="alert-footer">
                        <button onClick={onClose}>Dismiss</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
    if (loading) return <div className="loading">Loading Power Data...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    //limit number of points in chart
    const maxPoints = 50; 
    const sampledData = sampleData(voltageData, maxPoints);


    // Prepare chart data
    const chartData = {
        labels: sampledData.map(data => new Date(data.created_at).toLocaleString()),
        datasets: [{
            label: 'Voltage (V)',
            data: sampledData.map(data => data.volt),
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
                    text: 'Voltage (V)',
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
                max: 10,
                grid: {
                    color: 'rgba(255,255,255,0.1)' // Subtle grid lines
                }
            }
        }
    };

    return (
        <div className="power-container">
            {activeAlert && (
                <AlertModal 
                    message={activeAlert} 
                    onClose={handleAlertClose} 
                />
            )}
            
            <div className="top-bar">
                <button className="back-button" onClick={() => navigate('/Home')}>Back</button>
                <h1 className="page-title">Power Systems Monitor</h1>
            </div>
        
            <div className="main-content">
                <div className="left-section">
                    <div className="chart-section">
                        <h2 className="chart-title">Voltage Trajectory</h2>
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

                            <Batteries 
                                position={batteriesPosition}
                                scale={batteriesScale}
                                rotation={batteriesRotation}
                            />
                            <OrbitControls/>
                        </Canvas>
                    </div>
                </div>

                <div className="right-section">
                    <div className="table-container">
                        <table className="voltage-table">
                            <thead>
                                <tr>
                                    <th>Voltage</th>
                                    <th>Message</th>
                                    <th>Date/Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {voltageData.map((data) => (
                                    <tr key={data.id}>
                                        <td>{data.volt} V</td>
                                        <td>{data.message}</td>
                                        <td>{new Date(data.created_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
                border-radius: 10px;
                width: 400px;
                max-width: 90%;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
            }

            .alert-content {
                padding: 20px;
            }

            .alert-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid rgba(0, 255, 255, 0.2);
                padding-bottom: 10px;
                margin-bottom: 15px;
            }

            .alert-header h3 {
                color: #00ffff;
                margin: 0;
                font-size: 1.2rem;
            }

            .close-button {
                background: none;
                border: none;
                color: #ff4444;
                font-size: 1.5rem;
                cursor: pointer;
            }

            .alert-body p {
                color: #e0e0e0;
                margin-bottom: 15px;
            }

            .alert-footer {
                display: flex;
                justify-content: flex-end;
                border-top: 1px solid rgba(0, 255, 255, 0.2);
                padding-top: 15px;
            }

            .alert-footer button {
                background-color: #00ffff;
                color: #0a192f;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                transition: background-color 0.3s ease;
            }

            .alert-footer button:hover {
                background-color: #80ffff;
            }

                .top-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 20px;
                    background-color: rgba(0,0,0,0.2);
                }

                .back-button {
                    background-color: #00ffff;
                    color: #0a192f;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                }

                .back-button:hover {
                    background-color: #80ffff;
                }

                .page-title {
                    font-size: 2rem;
                    color: #00ffff;
                    margin: 0;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }

                .power-container {
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    background-color: #0a192f;
                }

                .main-content {
                    display: flex;
                    flex: 1;
                    padding: 20px;
                }

                .left-section {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    margin-right: 20px;
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
                    height: 400px;
                    background-color: rgba(0,0,0,0.3);
                    border-radius: 8px;
                }

                .right-section {
                    width: 40%;
                }

                .table-container {
                    height: 100%;
                    overflow-y: auto;
                    border: 2px solid #00ffff;
                    background-color: rgba(0,0,0,0.5);
                    border-radius: 8px;
                }

                .voltage-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 1rem;
                }

                .voltage-table thead {
                    background-color: #1a2b3c;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }

                .voltage-table th, .voltage-table td {
                    border: 1px solid #00ffff;
                    padding: 12px; 
                    text-align: left;
                }

                .voltage-table tr:nth-child(even) {
                    background-color: rgba(0,255,255,0.05);
                }

                @media (max-width: 768px) {
                    .main-content {
                        flex-direction: column;
                    }

                    .left-section, .right-section {
                        width: 100%;
                        margin-right: 0;
                    }

                    .battery-canvas {
                        height: 250px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Power;