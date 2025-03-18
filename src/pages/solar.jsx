import React, { useEffect, useState } from "react";
import Panel from '../models/panel.jsx';
import { Canvas } from "@react-three/fiber";
import { Line } from "react-chartjs-2"; //render line chartt
import axios from 'axios';
import { saveAs } from 'file-saver'; //to save files from client
import { OrbitControls } from "@react-three/drei";
import 'chart.js/auto';
import Navigation from './navigation.jsx';


const Solar = () => {
    const [powerData, setPowerData] = useState([]); //stores power data received from backend
    const [loading, setLoading] = useState(true); //tracks if data is still being fetched
    const [error, setError] = useState(null); //stoes error messages
    const [activeAlert, setActiveAlert] = useState(null); // Tracks active alert


    //adjusts panel size and position based on screen width
    const adjustPanelForScreenSize = () => {
        let screenScale = null;  //sca;e
        let screenPosition = [-2, 3, -3] //position panel
        let rotation = [-2, -0.5, 1]//rotation of panel
    
        if(window.innerWidth < 768){ //checks for mobile devices but keep same for both
            screenScale = [8, 8, 8];
        }
        else{
            screenScale = [8, 8, 8];
        }
    
        return [screenScale, screenPosition, rotation];
    }
    
    const [panelScale, panelPosition, panelRotation] = adjustPanelForScreenSize(); //values returned


    //data sampling function
    const sampleData = (data, maxPoints) => {//data and maxppoints
        if (data.length <= maxPoints) return data;//if data length ssmaller or equal to maxpoints - return data as is
        const step = Math.ceil(data.length / maxPoints); //else it filters out points and picks out every stepth data point
        return data.filter((_, index) => index % step === 0);
    };

    useEffect(() => {
        const fetchPowerData = async () => {
            try {

                //fetches power data by sending POSt request to add power and GET request to power
                await axios.post('http://localhost:8888/add-power');
                const response = await axios.get("http://localhost:8888/power");

                //if data fetched successfully - processes data 
                if (response.data && response.data.powerData) {
                    const data = response.data.powerData;

                    // Check watt conditions
                    let alertMessage = null;

                    //get latest data point
                    if (data.length > 0) {
                        const latestRecord = data[data.length - 1];

                        //if data not a number throw error
                        if (typeof latestRecord.watt !== 'number' || isNaN(latestRecord.watt)) {
                            alertMessage = 'Error: Non-readable power value detected!';
                        } else if (latestRecord.watt < 5) { //if data too low - throw error
                            alertMessage = 'Power too low!';
                        } else if (latestRecord.watt > 20) {//if data too high - throw error
                            alertMessage = 'Power too high!';
                        }

                        // Set alert if a condition is met
                        if (alertMessage) {
                            setActiveAlert(alertMessage);
                        }
                    }

                    setPowerData(data);
                } else {
                    //errorss
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

    //resets activeAlert state to null and closes alert modal
    const handleAlertClose = () => {
        setActiveAlert(null);
    };

    //renders alert modal
    const AlertModal = ({ message, onClose }) => (//takes two props message (alert message) and onClose - to close modal
        <div className="alert-overlay">
            <div className="alert-modal">
                <div className="alert-content">
                    <p>{message}</p>
                    
                    <button onClick={onClose}>Dismiss</button> 
                </div>
            </div>
        </div>
    );

    // const downloadCSV = () => {
    //     const csvHeader = ["ID,Message,Watts (W),Timestamp\n"];
    //     const csvRows = powerData.map(record =>
    //         `${record.id},${record.message},${record.watt},${record.created_at}`
    //     );
    //     const csvString = [csvHeader, ...csvRows].join("\n");
    //     const blob = new Blob([csvString], { type: "text/csv" });
    //     saveAs(blob, "powerData.csv");
    // };

    if (loading) return <div className="loading">Loading Solar Data...</div>; //if true - render loading message
    if (error) return <div className="error">Error: {error}</div>; //if not null -- render error emssage

    //limit number of points in chart
    const maxPoints = 50; 
    const sampledData = sampleData(powerData, maxPoints); //so chart does not display too many data points

    // Prepare chart data
    const chartData = {
        //labels - array defines labels for xazis
        //sampleddata.map - array containing sampled data
        //.map(data ->) - transform each element into  new value - formating timestamp
        //new Date - for each date item - creates new date object]
        //.tolocalestring - converts date object to eradable string
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

    //charts apperance

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: '#e0e0e0',
                    font: {
                        size: 14
                    }
                }
            }
        },
        scales: {
            x: {
                title: { 
                    display: true, 
                    text: 'Date/Time',
                    color: '#00ffff',
                    font: {
                        size: 14
                    }
                },
                ticks: {
                    color: '#e0e0e0',
                    font: {
                        size: 12
                    },
                    maxRotation: 45,
                    autoSkip: true,
                    autoSkipPadding: 10
                },
                grid: {
                    color: 'rgba(255,255,255,0.1)'
                }
            },
            y: {
                title: { 
                    display: true, 
                    text: 'Power Output (W)',
                    color: '#00ffff',
                    font: {
                        size: 14
                    }
                },
                ticks: {
                    color: '#e0e0e0',
                    font: {
                        size: 12
                    }
                },
                beginAtZero: true,
                grid: {
                    color: 'rgba(255,255,255,0.1)'
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
                <Navigation />
                <h1 className="page-title">Solar System</h1>
            </div>
        
            <div className="main-content">
                <div className="left-section">
                    <div className="chart-section">
                        <h2 className="chart-title">Power Output</h2>
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
            </div>

            <style>{`
                body {
                    background-color: #121212;
                    color: #e0e0e0;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
                                'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 
                                'Helvetica Neue', sans-serif;
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                }

                .power-container {
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    background-color: #121212;
                }

                .main-content {
                    display: flex;
                    gap: 16px;
                    padding: 16px;
                    height: calc(100vh - 70px);
                }

                .left-section {
                    flex: 1.6;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .right-section {
                    flex: 0.8;
                    display: flex;
                }

                .chart-section {
                    flex: 1;
                    background-color: #1a1a1a;
                    border-radius: 8px;
                    padding: 16px;
                    height: 45%;
                }

                .chart-container {
                    height: calc(100% - 30px);
                    width: 100%;
                }

                .battery-section {
                    flex: 1;
                    height: 45%;
                    background-color: #1a1a1a;
                    border-radius: 8px;
                    overflow: hidden;
                }

                .battery-canvas {
                    width: 100% !important;
                    height: 100% !important;
                }

                .table-container {
                    flex: 1;
                    background-color: #1a1a1a;
                    border-radius: 8px;
                    padding: 16px;
                    overflow: auto;
                }

                .voltage-table {
                    width: 100%;
                    border-collapse: collapse;
                    background-color: #1a1a1a;
                    font-size: 0.9rem;
                }

                .voltage-table th,
                .voltage-table td {
                    padding: 8px;
                    text-align: left;
                    border-bottom: 1px solid #333;
                }

                .voltage-table th {
                    background-color: #252525;
                    color: #fff;
                    font-weight: 600;
                    position: sticky;
                    top: 0;
                }

                .voltage-table tr:hover {
                    background-color: #252525;
                }

                .top-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 16px;
                    background-color: #1a1a1a;
                    border-bottom: 1px solid #333;
                    height: 46px;
                }

                .page-title {
                    color: #fff;
                    font-size: 1.5rem;
                    margin: 0;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }

                .alert-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }

                .alert-modal {
                    background-color: #1a1a1a;
                    border-radius: 8px;
                    width: 90%;
                    max-width: 400px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
                }

                .alert-content {
                    padding: 16px;
                }

                .alert-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid #333;
                }

                .alert-header h3 {
                    margin: 0;
                    color: #fff;
                }

                .alert-body {
                    margin-bottom: 16px;
                }

                .alert-footer {
                    display: flex;
                    justify-content: flex-end;
                    padding-top: 8px;
                    border-top: 1px solid #333;
                }

                .alert-footer button {
                    background-color: #333;
                    color: #fff;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                }

                .alert-footer button:hover {
                    background-color: #444;
                }

                .chart-title {
                    margin: 0 0 12px 0;
                    font-size: 1.2rem;
                    color: #fff;
                }

                @media (max-width: 1024px) {
                    .main-content {
                        flex-direction: column;
                    }

                    .right-section {
                        height: 300px;
                    }
                }

                @media (max-width: 768px) {
                    .top-bar {
                        flex-direction: column;
                        gap: 15px;
                    }

                    .page-title {
                        font-size: 1.5rem;
                    }

                    .main-content {
                        padding: 10px;
                        gap: 10px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Solar;