import React, { useEffect, useState } from 'react';
import axios from 'axios'; //HTTP client to fetch volage data
import { Canvas } from '@react-three/fiber'; //used to render 3D models
import { Line } from 'react-chartjs-2'; //displays real time line chart 
import 'chart.js/auto';
import Batteries from '../models/batteries.jsx';
import { OrbitControls } from "@react-three/drei"; //rotate camera around 3d obj
import { useNavigate } from 'react-router-dom';  
import Navigation from './navigation.jsx'; //navigation component

const Power = () => {
    const [voltageData, setVoltageData] = useState([]); //stores array of voltage readings from API
    const [loading, setLoading] = useState(true); //indicates if data is still loading
    const [error, setError] = useState(null); //stores error messages
    const [activeAlert, setActiveAlert] = useState(null); //stores alerts for low/hgih voltage
    const navigate = useNavigate(); //redirect to other pages

    //adjust battery model based on screen width
    const adjustBatteriesForScreenSize = () => {
        let screenScale = null;  
        let screenPosition = [-2, 3, -3] //position in 3d space
        let rotation = [-2, -0.5, 1] //rotation in 3d space
    
        if(window.innerWidth < 768){
            screenScale = [8, 8, 8]; //smaller scale for moile
        }
        else{
            screenScale = [8, 8, 8]; //normal scale
        }
    
        return [screenScale, screenPosition, rotation];
    }
    
    const [batteriesScale, batteriesPosition, batteriesRotation] = adjustBatteriesForScreenSize();

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
                await axios.post('http://localhost:8888/add-voltage'); //adds new voltage entry 
                //gets voltage data
                const response = await axios.get('http://localhost:8888/voltages');
                const data = response.data.voltageData; //store retrieved voltage data
                
                //if issue detected variable will store alert message
                let alertMessage = null;
                //checks if data exists 
                if (data && data.length > 0) {
                    const latestRecord = data[data.length - 1]; //get latest voltage
                    //isNaN checks if value is not a number
                    if (typeof latestRecord.volt !== 'number' || isNaN(latestRecord.volt)) { //typeof checks if volt is not a number at all(null, string, etc)
                        //NaN only works on values that js can convert into a number
                        alertMessage = 'Error: Non-readable voltage detected!'; //if not send alert
                    } 
                    //if voltage too high or low trigger alert 
                    else if (latestRecord.volt < 5) {
                        alertMessage = 'Voltage too low!';
                    } else if (latestRecord.volt > 10) {
                        alertMessage = 'Voltage too high!';
                    }
    
                    if (alertMessage) {
                        setActiveAlert(alertMessage); //show alert
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
    
        fetchVoltageData();

        //async function - asyncrhoous operations
        //use await 
        
        //fetcb data  every 5 secs
        const intervalId = setInterval(() => {
            const fetchData = async () => { //get data from backend
                try {
                    const response = await axios.get('http://localhost:8888/voltages'); //GEt request
                    setVoltageData(response.data.voltageData); //state setter - updates voltageData state - rerender to show latest reading
                } catch (err) {
                    setError(err.message);
                }
            };
            fetchData(); //calls function before waiting
        }, 5000);
    
        return () => clearInterval(intervalId); //cleared when component unmounts 
    }, []);
//mount component = added to react DOM and becomes visible on screen (component first loads or rerenders)
//unmounts - removes from react DOM - user navigates to other page 
    const handleAlertClose = () => {
        setActiveAlert(null);
    }

    //create alert 
    //displays alert popup when issue
    const AlertModal = ({ message, onClose }) => {
        return (
            //overlay - darkens background
            <div className="alert-overlay">
                
                <div className="alert-modal"
                    //alert box centered on screen
                > 
                    <div className="alert-content">
                        <div className="alert-header">
                            <h3>System Alert</h3>
                            <button className="close-button" 
                            //onClose - removes modal
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
            {activeAlert && (
                <AlertModal //display alert if activeAlert is not null
                    message={activeAlert} //show alert message
                    onClose={handleAlertClose} //close alert when clicked
                />
            )}
            
            <div className="top-bar"> 
                <Navigation 
                //navigation bar 
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
                                position={batteriesPosition} //position battery
                                scale={batteriesScale} //scale it
                                rotation={batteriesRotation} //rotate model
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
            
            <style>{` 
                body {
                    background-color: #121212; /* dark background*/
                    color: #e0e0e0; /* light grey teext */
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
                                'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 
                                'Helvetica Neue', sans-serif; /*fonts*/
                    margin: 0; /*remove default spacing*/
                    padding: 0; /*remove defaalt spacing */
                    overflow: hidden; /*prevent scrolling */
                } 

                .power-container {
                    display: flex; 
                    flex-direction: column; /*stack elements vertically*/
                    height: 100vh; /*fill entire screen heiht*/
                    background-color: #121212; /*dark background*/
                }

                .main-content {
                    display: flex; /*horizontal layout*/
                    gap: 16px; /*add spacing between components*/
                    padding: 16px; /*add internal spacing*/
                    height: calc(100vh - 70px); /* account for top bar - exclude */
                }

                .left-section {
                    flex: 1.6; /*takes more space*/
                    display: flex;
                    flex-direction: column; /*vertical layout*/
                    gap: 16px;
                }

                .right-section {
                    flex: 0.8;
                    display: flex;
                }

                .chart-section {
                    flex: 1; /*take equal space in container*/
                    background-color: #1a1a1a; /*dark background*/
                    border-radius: 8px; /*round corners*/
                    padding: 16px; /*spacing inside cointainer*/
                    height: 45%; /*limit height to 45% of its parent*/
                }

                .chart-container {
                    height: calc(100% - 30px); /*reverses 30px for title*/
                    width: 100%; /*full width*/
                }

                .battery-section {
                    flex: 1; /*equal space*/
                    height: 45%; /*consisten height*/
                    background-color: #1a1a1a;
                    border-radius: 8px;
                    overflow: hidden; /*prevents scrolling issues*/
                }

                .battery-canvas {
                    width: 100% !important; /*forces full width and height*/
                    height: 100% !important; /*!important overrides other styles*/
                }

                .table-container {
                /*voltage table*/
                    flex: 1;
                    background-color: #1a1a1a;
                    border-radius: 8px;
                    padding: 16px;
                    overflow: auto;
                }

                .voltage-table {
                /*voltage table styling*/
                    width: 100%;
                    border-collapse: collapse; /*removes space between table borders*/
                    background-color: #1a1a1a;
                    font-size: 0.9rem; 
                }

                /*defines spacing and alignment for cells*/
                .voltage-table th,
                .voltage-table td {
                    padding: 8px;
                    text-align: left;
                    border-bottom: 1px solid #333;
                }

                .voltage-table th {
                    background-color: #252525;
                    color: #00ffff;
                    font-weight: 600;
                    position: sticky; /*makes header stick to top when scrolling*/
                    top: 0;
                }

                /*highlights rows when hovered*/
                .voltage-table tr:hover {
                    background-color: #252525;
                }

                .top-bar {
                    display: flex; /*align navigation horizontally*/
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

                /*alert modal w semi transparent background*/
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
                    z-index: 1000; /*makes sure element is on top*/
                }

                /*centered box w shadow - width 400 px*/
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

                /*header can be flexibiliy posiioned with bottom border*/
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
                    color: #00ffff;
                }

                .close-button {
                    background: none;
                    border: none;
                    color: #e0e0e0;
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 0;
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
                    color: #00ffff;
                }

                /*make main content vertical and shrink in height (mobile)*/
                @media (max-width: 1024px) {
                    .main-content {
                        flex-direction: column;
                    }

                    .right-section {
                        height: 300px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Power;