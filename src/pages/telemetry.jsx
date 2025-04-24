import React, { useEffect, useState } from "react";
import axios from "axios"; //HTTP client used to make requests to an api
import Navigation from './navigation.jsx'; //navigation component
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import './css/telemetry.css';





const TelemetryData = ({ setAuthenticated, setUserType, setCallsign, authenticated}) => {
    const [telemetry, setTelemetry] = useState([]); //store telemetry data
    const [loading, setLoading] = useState(false); //manage loading state - data being fetched
    const [recording, setRecording] = useState(false); //track if recoding is active
    const [error, setError] = useState(null); //store errors
    const [plots, setPlots] = useState([]); //store path to plot images
    const [recordingStatus, setRecordingStatus] = useState('idle'); //tracks current status of recording: idle, recording, stopped
    const [stopTime, setStopTime] = useState(null);
  
    const apiUrl = import.meta.env.VITE_API_URL;

//mounting - rendering component and inseriting into DOM 
//react needs to know when to initalize a component - set state, fetch data 
//state intilization, renders

//useEffect runs after rendering component 


    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [messageFilter, setMessageFilter] = useState(""); // filter telemetry by message




    //sFunction to fetch telemetry data




    //start recording - sends request to start recording
    const startRecording = async () => {
        setLoading(true);
        setError(null);
        try {
            
            

            const response = await axios.get(`${apiUrl}/api/start-recording`, { //send GET request to start recroding
                withCredentials: true
            });
            
            
            //if response = success - recording state = true and recordingStatus = recording
            if (response.data.success) {
                setRecording(true);
                setRecordingStatus('recording');
            } else {//if error - throw error
                throw new Error(response.data.error || 'start record failed');
            }
        } catch (error) {
            setError(error.response?.data?.error || error.message || 'server error');
            setRecording(false);
        } finally {
            setLoading(false);
        }
    };
    
    //stop recordinggggg
    const stopRecording = async () => {
        try {
            setLoading(true);
            setError(null);


            const response = await axios.get(`${apiUrl}/api/stop-recording`, { //SEnd GET request to stop
            
                withCredentials: true
            });
            
            
            //if successful - update recording state to false and reocrdingStatus to stopped
            if (response.data.success) { 
                setRecording(false);
                setRecordingStatus('stopped');
                setStopTime(response.data.timestamp)
            } else { //if error - log error 
                throw new Error(response.data.error || 'failed');
            }
        } catch (error) {
            setError(error.response?.data?.error || error.message || 'server fail');
        } finally {
            setLoading(false);
        }
    };


    const fetchTelemetry = async () => {
        const params = {};
         if (startDate) params.start = startDate.toISOString();
        if (endDate) params.end = endDate.toISOString();
        try {
            
    
            const response = await axios.get(`${apiUrl}/api/telemetry`, { params });
            console.log(response.data);
            if (Array.isArray(response.data)) {
                setTelemetry(response.data);
            }
        } catch (err) {
            console.error("err fetching", err);
        }
    };
    


    //runs wehn component mounts to fetch telemetry data
    useEffect(() => {
        fetchTelemetry();
        const interval = setInterval(fetchTelemetry, 2000); //refresh telemetry every 2 seconds
        return () => clearInterval(interval); //stop interval when component unmounts (prevent memory leak)
    }, []);



    return (
        <div className="container">
            
            <div className="contentWrapper">
                <Navigation
                  setAuthenticated={setAuthenticated}
                  setUserType={setUserType}
                  setCallsign={setCallsign}
                  isAuthenticated={authenticated}
                />
                <h1 className="heading">Audio Recorder</h1>

                <div className="datePickerWrapper">
                    <div>
                        <label style={{marginRight:'0.5rem'}} className="dateLabel">Start Date</label>
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            showTimeSelect
                            dateFormat="Pp"
                            placeholderText="Select start date"
                        />
                    </div>
                    <div>
                        <label style={{marginRight:'0.5rem'}} className="dateLabel">End Date</label>
                        <DatePicker
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            showTimeSelect
                            dateFormat="Pp"
                            placeholderText="Select end date"
                        />
                    </div>
                    <button style={{ marginTop: '1.5rem' }}  onClick={fetchTelemetry} className="button">
                        Filter
                    </button>
                    <button  style={{ marginTop: '1.5rem' }} onClick={() => { setStartDate(null); setEndDate(null); fetchTelemetry(); }} className="button">
                        Clear
                    </button>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                <input
                    type="text"
                    placeholder="Search messages..."
                    value={messageFilter}
                    onChange={(e) => setMessageFilter(e.target.value)}
                    style={{
                        padding: '0.5rem',
                        width: '100%',
                        backgroundColor: 'rgb(39, 39, 42)',
                        border: '1px solid rgb(55, 65, 81)',
                        color: 'white',
                        fontSize: '1rem',
                        borderRadius: '0.25rem',
                    }}
                />
            </div>
                
                <div className="buttonContainer">
                    <button 
                        className={recording || loading ? "buttonDisabled" : "button"} //if recording or loading = true - apply buttonDisabled style 
                        //else apply regular style
                        onClick={startRecording} //event handler for click envent on button
                        //when button clicked - it triggers startRecording function
                        disabled={recording || loading} //button disabled when either recording or laoding true to prevent from clicking again while recording/loading
                    >
                        {loading ? "Processing..." : recording ? "Recording..." : "Start Recording"}
                    </button>
                    <button 
                        className={!recording ? "buttonDisabled" : "button"} //disabled when recording is false
                        onClick={stopRecording} //even handler to trigger stopRecording when button clicked
                        disabled={!recording || loading} //recording is false oor loading is true
                    >
                        Stop Recording
                    </button>
                </div>

                <div className="telemetryList">
                {telemetry
                    .filter(entry =>
                        entry.message?.toLowerCase().includes(messageFilter.toLowerCase())
                    )
                    .map((entry, index) => ( //iterates over telemetry entry in telemetry array and render data
                        <div key={index} className="telemetryCard">
                            <div className="cardGrid">
                                <div>
                                    <h3 className="subHeading">Message</h3>
                                    <p className="message">
                                        {entry.message || "No message available"}
                                    </p>
                                
                                    {entry.binary_data && ( //checks if binary_data exists in current telemtry entry - if exists - render section w binary data for that entry
                                        <>
                                            <h3 className="subHeading">Binary Data</h3>
                                            <p className="binaryMessage">
                                            {Array.isArray(entry.binary_data.data)
                                                ? String.fromCharCode(...entry.binary_data.data)
                                                : JSON.stringify(entry.binary_data)}
                                            </p>
                                        </>
                                    )}
                                   
                                    <p className="timestamp"
                                    //converts created_at timestamp of entry into readable format
                                    >
                                        {new Date(entry.created_at).toLocaleString()}
                                    </p>
                                    
                                </div>
                                <div>
                                    {console.log(entry.goertzelPlotPath )}
                                    <h3 className="subHeading">Analysis Plots</h3>
                                    {entry.plot_path && (
                                        <img
                                        src={`${apiUrl}/${entry.plot_path}`}
                                        alt="Audio Analysis"
                                        className="image"
                                        />
                                    )}
                                    {entry.goertzelPlotPath  && (
                                        <img
                                        src={`${apiUrl}/${entry.plot_path}`}
                                        alt="Goertzel Power Plot"
                                        className="image"
                                        />
                                    )}
                                    </div>

                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TelemetryData;