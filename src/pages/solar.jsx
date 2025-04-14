import React, { useEffect, useState } from "react";
import Panel from '../models/panel.jsx';
import { Canvas } from "@react-three/fiber";
import { Line } from "react-chartjs-2"; //render line chartt
import axios from 'axios';
import { saveAs } from 'file-saver'; //to save files from client
import { OrbitControls } from "@react-three/drei";
import 'chart.js/auto';
import Navigation from './navigation.jsx';
import './css/solar.css';


const Solar = ({ setAuthenticated, setUserType, setCallsign, authenticated}) => {
    const [powerData, setPowerData] = useState([]); //stores power data received from backend
    const [loading, setLoading] = useState(true); //tracks if data is still being fetched
    const [error, setError] = useState(null); //stoes error messages
    const [alertMsg, setalertMsg] = useState(null); // Tracks active alert

    //panel configuration
    const panelConfig = {
        scale: [8, 8, 8], 
        position: [-2, 3, -3],
        rotation: [-2, -0.5, 1]
    };



    //data sampling function
    const sampleData = (data, maxPoints) => {//data and maxppoints
        if (data.length <= maxPoints) return data;//if data length ssmaller or equal to maxpoints - return data as is
        const step = Math.ceil(data.length / maxPoints); //else it filters out points and picks out every stepth data point
        return data.filter((_, index) => index % step === 0);
    };

    useEffect(() => {
        const getPowerData = async () => {
            try {

                //fetches power data by sending POSt request to add power and GET request to power
                await axios.post('http://localhost:8888/api/add-power');
                const response = await axios.get("http://localhost:8888/api/power");

                //if data fetched successfully - processes data 
                if (response.data && response.data.powerData) {
                    const data = response.data.powerData;


                    //get latest data point
                    if (data.length > 0) {
                        const latest = data[data.length - 1];

                        //if data not a number throw error
                        if (typeof latest.watt !== 'number' || isNaN(latest.watt)) {
                            setalertMsg('Unreadable power value');
                        } else if (latest.watt < 5) { //if data too low - throw error
                            setalertMsg('Power too low!');
                        } else if (latest.watt > 20) {//if data too high - throw error
                            setalertMsg('Power too high!');
                        }

                       
                    }

                    setPowerData(data);
                } else {
                    //errorss
                    throw new Error('No data');
                }
            } catch (error) {
                setError(error.message);
                setalertMsg('Error fetching power data');
            } finally {
                setLoading(false);
            }
        };

        getPowerData();
    }, []); // Trigger only on mount

    

    //renders alert modal
    const Alert = ({ message, onClose }) => (//takes two props message (alert message) and onClose - to close modal
        <div className="alert-overlay">
            <div className="alert-modal">
                <div className="alert-content">
                    <p>{message}</p>
                    
                    <button onClick={onClose}>Dismiss</button> 
                </div>
            </div>
        </div>
    );

   

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
            {alertMsg && (
                <Alert 
                    message={alertMsg} 
                    onClose={() => setalertMsg(null)} 
                />
            )}
            
            <div className="top-bar">
                <Navigation 
                      setAuthenticated={setAuthenticated}
                      setUserType={setUserType}
                      setCallsign={setCallsign}
                      isAuthenticated={authenticated}
                />
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
                                position={panelConfig.position}
                                scale={panelConfig.scale}
                                rotation={panelConfig.rotation}
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

           
        </div>
    );
};

export default Solar;