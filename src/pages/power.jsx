import React, { useEffect, useState } from 'react';
import axios from 'axios'; //HTTP client to fetch volage data
import { Canvas } from '@react-three/fiber'; //used to render 3D models
import { Line } from 'react-chartjs-2'; //displays real time line chart 
import 'chart.js/auto';
import Batteries from '../models/batteries.jsx';
import { OrbitControls } from "@react-three/drei"; //rotate camera around 3d obj
import { useNavigate } from 'react-router-dom';  
import Navigation from './navigation.jsx'; //navigation component
import "./css/power.css";


const Power = ({ setAuthenticated, setUserType, setCallsign, authenticated }) => {
    const [voltageData, setVoltageData] = useState([]); //stores array of voltage readings from API
    const [loading, setLoading] = useState(true); //indicates if data is still loading
    const [error, setError] = useState(null); //stores error messages
    const [alertMsg, setalertMsg] = useState(null); //stores alerts for low/hgih voltage


    //battery config
    const battConfig = {
        scale: [8, 8, 8], 
        position: [-2, 3, -3],
        rotation: [-2, -0.5, 1]
    };
    const apiUrl = import.meta.env.VITE_API_URL;

    //sample data for chart
    //data = array of data points
    const sampleData = (data, maxPoints) => { //maxPoints - maximum number of poins to keep
        if (data.length <= maxPoints) return data; //prevents chart from rendering too many points
        //if data too large - keep only maxPoints evenely spaced samples
        const step = Math.ceil(data.length / maxPoints); //determines how many points to skip
        //ignore first argument value in filter by using _
        //index = index of current element in array
        //index % step === 0 - keep only elements where index iss a multiple of step
        //arrow function (shorthand for defining function in javascript)
        return data.filter((_, index) => index % step === 0); //.filter - loops through array
    };


    //fetch volt data from API and store in voltageData
    
    useEffect(() => {
        //async function tat sends POST request (add new voltage entry)
        //sends GET request to retrive voltage data
        const fetchVoltageData = async () => {
            try {
                //sends POST request
                await axios.post(`${apiUrl}/api/add-voltage`); //adds new voltage entry 
                //gets voltage data
                const res = await axios.get(`${apiUrl}/api/voltages`);
                const data = res.data.voltageData; //store retrieved voltage data
                
                //if issue detected variable will store alert message
                //checks if data exists 
                if (data && data.length > 0) {
                    const latest = data[data.length - 1]; //get latest voltage
                    //isNaN checks if value is not a number
                    if (typeof latest.volt !== 'number' || isNaN(latest.volt)) { //typeof checks if volt is not a number at all(null, string, etc)
                        //NaN only works on values that js can convert into a number
                        setalertMsg('Unreadable'); //if not send alert
                    } 
                    //if voltage too high or low trigger alert 
                    else if (latest.volt < 5) {
                        setalertMsg('Voltage too low!');
                    } else if (latest.volt > 10) {
                        setalertMsg('Voltage too high!');
                    }
    
                   
                }
    
                setVoltageData(data);
            } catch (err) {
                setError(err.message);
                setalertMsg('Error getting voltage data');
            } finally {
                setLoading(false);
            }
        };
    
        fetchVoltageData();

        //async function - asyncrhoous operations
        //use await 
        
        //fetcb data  every 5 secs
        const interval = setInterval(() => {
            const fetchData = async () => { //get data from backend
                try {
                    const res = await axios.get(`${apiUrl}/api/voltages`); //GEt request
                    setVoltageData(res.data.voltageData); //state setter - updates voltageData state - rerender to show latest reading
                } catch (err) {
                    setError(err.message);
                }
            };
            fetchData(); //calls function before waiting
        }, 5000);
    
        return () => clearInterval(interval); //cleared when component unmounts 
    }, []);
//mount component = added to react DOM and becomes visible on screen (component first loads or rerenders)
//unmounts - removes from react DOM - user navigates to other page 
    

    //create alert 
    //displays alert popup when issue
    const Alert = ({ message, onClose }) => {
        return (
            //overlay - darkens background
            <div className="alert-overlay">
                
                <div className="alert-box"
                    //alert box centered on screen
                > 
                    <div className="alert-content">
                        <div className="alert-header">
                            <h3>System Alert</h3>
                            <button className="close-button" 
                            //onClose - removes box
                            onClick={onClose}>×</button> 
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
 
    //prevent chart from rendering until data ready
    if (loading) return <div className="loading">Loading Power Data...</div>; //if loading true display
    if (error) return <div className="error">Error: {error}</div>; //if error then display erorr

    const maxPoints = 50; //limit number of points plotted on chart so it doesn't get super big
    const sampledData = sampleData(voltageData, maxPoints); //fsampeData = function that reduces the dataset size

    //chart configuration
    //sampleData - reduces number of points plotted
    const chartData = {
        //x axis values (timestamps)
        //converts created_at timespatmsp to data/time strings
        labels: sampledData.map(data => new Date(data.created_at).toLocaleString()),
        datasets: [{ //defines plotted voltage values
            label: 'Voltage (V)',
            data: sampledData.map(data => data.volt), //extracts volt value from sampledData
            borderColor: '#00ffff', //line colr cyan
            backgroundColor: 'rgba(0, 255, 255, 0.2)', //fill color 0 transparent cyna
            fill: true, //fill area under line
            tension: 0.4, //makes line slightly curved instead of jagged
        }],
    };

    const options = {
        responsive: true, //makes chart adjust to different screen sizes
        maintainAspectRatio: false, //chart can stretch freely
        plugins: {
            legend: {
                labels: {
                    color: '#e0e0e0', //light grey
                    font: {
                        size: 14 // font size
                    }
                }
            }
        },
        scales: {
            x: {
                title: { 
                    display: true, 
                    text: 'Date/Time',
                    color: '#00ffff', //cyan
                    font: {
                        size: 14 //font size
                    }
                },
                ticks: {
                    color: '#e0e0e0', //light grey 
                    font: {
                        size: 12
                    },
                    maxRotation: 45, //angles label at 45 degrees
                    autoSkip: true, //hides labels when space limited
                    autoSkipPadding: 10 //adds extra spacing between alabels
                },
                grid: {
                    color: 'rgba(255,255,255,0.1)' //light grey
                }
            },
            y: {
                title: { 
                    display: true, 
                    text: 'Voltage (V)', //y axis title
                    color: '#00ffff', //cyan
                    font: {
                        size: 14
                    }
                },
                ticks: {
                    color: '#e0e0e0', //grey
                    font: {
                        size: 12
                    }
                },
                beginAtZero: true, //0V
                max: 10, //cap it
                grid: {
                    color: 'rgba(255,255,255,0.1)' //grid lines lightly visible
                }
            }
        }
    };

    return (
        <div className="power-container">
            {alertMsg && (
                <Alert //display alert if alertMsg is not null
                    message={alertMsg} //show alert message
                    onClose={() => setalertMsg(null)} //close alert when clicked
                />
            )}
            
            <div className="top-bar"> 
                <Navigation 
                //navigation bar 
                setAuthenticated={setAuthenticated}
                setUserType={setUserType}
                setCallsign={setCallsign}
                isAuthenticated={authenticated}
                />
                <h1 className="page-title">Power System</h1>
            </div>
        
            <div className="main-content">
                <div className="left-section"
                //left section (voltage chart and battery model)
                >
                    <div className="chart-section">
                        <h2 className="chart-title">Voltage</h2>
                        <div className="chart-container">
                            <Line data={chartData} options={options}
                            
                            //passes voltage data to chart
                            //configrues chart style (options)
                            />
                        </div>
                    </div>

                    <div className="battery-section">
                        <Canvas className="battery-canvas"
                        //canvas for 3d model
                        >
                            
                            <ambientLight intensity={0.5} 
                            //lighting
                            />
                            <directionalLight position={[15, -5, 1]} intensity={0.5} />
                            <directionalLight position={[4, -5, 1]} intensity={0.5} />
                            <directionalLight position={[4, -3, 1]} intensity={0.5} />

                            <Batteries 
                                position={battConfig.position} //position battery
                                scale={battConfig.scale} //scale it
                                rotation={battConfig.rotation} //rotate model
                            />
                            <OrbitControls
                            //can rotate and zoom the model
                            />
                        </Canvas>
                    </div>
                </div>

                <div className="right-section"
                //table
                >
                    <div className="table-container">
                        <table className="voltage-table">
                            <thead
                            //table header
                            >
                                <tr
                                //row
                                
                                >
                                    <th
                                    //column names
                                    >Voltage</th>
                                    <th>Message</th>
                                    <th>Date/Time</th>
                                </tr>
                            </thead>
                            <tbody
                            //table body
                            >
                                
                                {voltageData.slice(-20).map((data) => ( //slice - keeps only latest 20 records; map - loop throguh data and create row for each record
                                    <tr key={data.id}
                                    //uses key-data.id to properly track list updaates
                                    >
                                        <td
                                        //format voltage to 2 decimal places
                                        >{data.volt.toFixed(2)} V</td>
                                        <td
                                        //display error messages
                                        >{data.message}</td>
                                        <td
                                        //converts timestamp to readable format
                                        >{new Date(data.created_at).toLocaleString()}</td>
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

export default Power;