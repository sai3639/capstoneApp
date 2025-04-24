import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "./navigation.jsx"; //navigation bar component
import "./css/antenna.css";

//users can sumbit new logs
//manage user authentication/session verification
//table of availabel commands
//can navigate to telemetry data page



const Antenna = ({ setAuthenticated, setUserType, setCallsign, authenticated, userType, callsign }) => {
    const [telemetryData, setTelemetryData] = useState(""); //store telemetry data inputted from user
    const [logs, setLogs] = useState([]); //store telemetry logs
    const [selectedCallsign, setSelectedCallsign] = useState(callsign || ""); //store current selected callsgin
    const [filteredLogs, setFilteredLogs] = useState([]); //store logs filtered by the callsign
    const [sessionStatus, setSessionStatus] = useState(null); //track if session is valid, invalid, or an error occurred
    const navigate = useNavigate(); //navigate to differenet pages

    //defining available commands
    const commandTable = [
        { command: "Deploy Antenna", description: "Unfold antennas on CubeSat" },
        { command: "Get voltage", description: "Ask CubeSat for voltage reading" }
    ];

    const fetchLogs = async () => { //get log
        try {
            const res = await fetch("http://localhost:8888/api/logs", { //GEt request to get log
                credentials: "include" //ensure cookies are sent with request
            });

            //if error - throw error with HTTP status
            if (!res.ok) {
                throw new Error(`err: ${res.status}`); //if request fails - error
            }

            //parses json response 
            const data = await res.json();
          //  console.log("Fetched logs:", data);
            setLogs(data); //update logs state with data received

            //filters log based on selected callsign
            const filtered = selectedCallsign 
            //check if selecedCallsign eists - if true filter logs where log.callsign === selectedCallsign
            //if faslse - uses all logs
            //.filter() creates new array contaitning the logs that meet the condition
            //loop through each log and keep logs where theres a match
            ? data.filter(log => log.callsign === selectedCallsign) //ternary/conditional operator
            : data;
        
       // console.log("Filtered logs:", filtered); // Debug log
        setFilteredLogs(filtered); //update filteredLogs state w relevant logs
        } catch (error) {  //catch errorssss
            console.error("Error:", error);
            alert(`could not get logs: ${error.message}`);
        }
    };


    useEffect(() => { //runs fetchlogs when component mounts
        
        fetchLogs();
        
    }, [sessionStatus]); //reruns whenever the sessioniStatus changes

    // Update filtered logs when selectedCallsign changes
    useEffect(() => { //if selected callsign changes then logs are refiltered
        if (logs.length > 0) { //run if logs exist
            const filtered = selectedCallsign // if selectedCallsign exists - filter logs
            //else use all logs
            //condition ? value_if_true : value_if_false
            //creates new filtered array and loo[s through each log to check for match]
                ? logs.filter(log => log.callsign === selectedCallsign)
                : logs;
            setFilteredLogs(filtered); //store in filtered logs
        } //runs if user selects different callsign 
    }, [selectedCallsign, logs]); ///new logs fetched from API

    //verify user session
    useEffect(() => {
        const checkSession = async () => { 
            try {
                const res = await fetch("http://localhost:8888/api/verify-session", { //send request to check user session
                    method: 'GET',
                    credentials: "include" //cookies included w request
                });

                //check if response successful
                if (!res.ok) {
                    throw new Error(`err: ${res.status}`); //error getting request
                }

                //parses json response from server and store in data variable
                const data = await res.json();
                //if session valid - store callsign and sessionstatus = valid
                if (data.success) {
                    setSelectedCallsign(data.callsign); //set selectedcallsign to callsign receied from server
                    setSessionStatus("valid"); //sessionstatus = valid
                    setAuthenticated(true);
                    setUserType("authenticated"); 
                    setCallsign(data.callsign);
                    console.log("callsign:", data.callsign); //log in console for debug
                } else { //if invalid - then sessionstatus = invalid
                    setSessionStatus("invalid"); //session = invalid
                    console.log("guest"); //log in console
                }
            } catch (error) { //error verifying session
                console.error("Error:", error);
                setSessionStatus("error");
            }
        };

        checkSession(); //call checkSession function to initiate session verification when componenet mounts
    }, []);

    //navigate to telemetry page when button clicked
    const handleNavigateToTelemetry = () => {
        navigate("/telemetry");
    };

    //log session
    const handleLogSubmit = async () => { //handle process of submitting log
        //if guest (no radio license) - cant add new log
        if (userType === "guest" || sessionStatus !== "valid") { //if user is guest
            alert("Unable to add log."); //display alert
            return; //return
        }

        try {
            //send POSt request w telemetry daata if new log made
            const res = await fetch("http://localhost:8888/api/add-log", {
                method: "POST", //POST request 
                credentials: "include", //cookies sent with request
                headers: {
                    "Content-Type": "application/json" ///request body is in JSON format
                },
                body: JSON.stringify({ //conoverts data to JSON format to sned in request body
                    callsign: selectedCallsign, //callsign of user submitting log
                    telemetry_data: telemetryData //telemetry data enetered by user
                })
            });

            const data = await res.json(); //parses JSON response from server and store in data variable
            //if success - clear input and refresh the logs to show new ones
            if (res.ok && data.success) { //check if response successfil and server indicates success
                alert(data.message); //display alert - success
                setTelemetryData(""); //clear data input
                fetchLogs(); //refresh to update list of logs
            } else { //else error
                alert(data.message || "Couldn't add log");
            }
        } catch (error) { //catch errors
            console.error("Error submitting log:", error);
            alert(`Error submitting log: ${error.message}`);
        }
    };

    //extract array of callsign from logs (logs.map((log) => log.callsing))
    //new Set() - convert array into set (removes duplicates)
    //...new = converts set back to array
    //store array into variable uniqueCallsigns
    const uniqueCallsigns = [...new Set(logs.map((log) => log.callsign))];

    return (
        
            
            <div className="container">
                <Navigation 
                key={authenticated ? "auth" : "guest"}
                //render navigation bar
                setAuthenticated={setAuthenticated}
                setUserType={setUserType}
                setCallsign={setCallsign}
                isAuthenticated={authenticated}
                />
                
                <h2 className="header">Space Telemetry Log</h2>

               


                <div
                //commands table 
                >
                    <h3 className="header">Available Commands</h3>
                    <table className="table">
                        <thead>
                            <tr
                            //table row
                            >
                                <th>Command</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {commandTable.map((cmd, index) => ( //loops through each command object in commandTable
                            //for each cmd, creates new table row
                            //key - identifyes each row uniquely
                                <tr key={index}>
                                    <td
                                    //display command in first column
                                    >
                                        {cmd.command}</td>
                                    <td
                                    //display description of the commad in 2nd column
                                    >
                                        {cmd.description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <button
                    onClick={handleNavigateToTelemetry} //executes handleNavigateToTelemetry function
                    className="button"
                >
                    View Telemetry Data
                </button>

                <div>
                    <select //dropdown select element
                        value={selectedCallsign} //value of dropdown to selectedCallsign stae
                        //updates selected call sign when new option is selected from dropdown
                        onChange={(e) => setSelectedCallsign(e.target.value)} 
                        className="select"
                        
                    >
                        <option value="">Select a callsign</option>
                        {uniqueCallsigns.map((call, index) => (//loop over uniqueCallsigns array and redners option for eac
                        //unique key for each option
                        //value=call - set value of dropdown option to curent callsign
                        //call - displays callsign as option text
                            <option key={index} value={call}>{call}</option>
                            
                        ))}
                        

                    </select>

                    {userType === "authenticated" && (// text area and subit utton are shown only for validated users
                        <div>
                            <textarea
                                className="textarea" //multi line text input
                                placeholder="Enter telemetry data..."
                                value={telemetryData} 
                                onChange={(e) => setTelemetryData(e.target.value)} //updates telemetryData state when user types in text area
                            />
                            <button
                                onClick={handleLogSubmit} //function to handle submit of telemetry data
                                className="button"
                            >
                                Submit Log
                            </button>
                        </div>
                    )}
                </div>

                <h3 className="header">Transmission Logs: {selectedCallsign}</h3>

                <div className="logs-grid"
                //render transmission logs
                > 
                
                    {filteredLogs.length > 0 ? ( //if there are logs to display then logs are mapped into individual log cards
                        filteredLogs.map((log, index) => ( //.map loops over filtered logs array and renders a card for each log
                            //unique key for each log card
                            <div key={index} className="log-card">
                                <div className="log-title">{log.callsign}</div> 
                                <p
                                //displays telemetry data of log
                                >{log.telemetry_data}</p>
                                <div className="log-date"
                                //displays formatted creation date of log
                                >
                                    {new Date(log.created_at).toLocaleString()} 
                                </div>
                            </div>
                        ))
                    ) : (
                         //if none available - displays no transmission logs available
                        <div className="empty-logs"> 
                            No transmission logs available
                        </div>
                    )}
                </div>
            </div>
        
    );
};

export default Antenna;
