import React, { useEffect, useState } from "react";
import axios from "axios"; //HTTP client used to make requests to an api
import Navigation from './navigation.jsx'; //navigate to different pages


const TelemetryData = () => {
    const [telemetry, setTelemetry] = useState([]); //store telemetry data
    const [loading, setLoading] = useState(false); //manage loading state - data being fetched
    const [output, setOutput] = useState(""); //store ouput of python script
    const [recording, setRecording] = useState(false); //track if recoding is active
    const [error, setError] = useState(null); //store errors
    const [plots, setPlots] = useState([]); //store path to plot images
    const [recordingStatus, setRecordingStatus] = useState('idle'); //tracks current status of recording: idle, recording, stopped
    const [asciiData, setAsciiData] = useState([]);  //store ascii data 

  


//mounting - rendering component and inseriting into DOM 
//react needs to know when to initalize a component - set state, fetch data 
//state intilization, renders

//useEffect runs after rendering component 



    //sFunction to fetch telemetry data
    const fetchTelemetry = async () => {
        try {
            const response = await axios.get("http://localhost:8888/telemetry"); //make GET request to fetch telemetry data
            console.log("Telemetry data:", response.data); //log response in console to check
    
            if (Array.isArray(response.data)) { //check if response contains array 
                setTelemetry(response.data); // update telemetry state with data fetched
    
                // Extract ASCII messages and plot paths
                const asciiMessages = response.data.map(entry => entry.message);
                const plotPaths = response.data.map(entry => entry.plot_path);
    
                setAsciiData(asciiMessages);  // Store ASCII messages
                setPlots(plotPaths);          // Store plot paths
            } else {
                console.error("Expected array but got:", response.data);
                setTelemetry([]);
            }
        } catch (err) { //if error - log error and set telemetry to empty array
            console.error("Error fetching telemetry data:", err);
            setTelemetry([]);
        } finally {
            setLoading(false);
        }
    };


    //starts pythonscriprt
    // const startPythonScript = async () => {
    //     setLoading(true);
    //     try {
    //         const response = await axios.get("http://localhost:8888/run-python");
    //         console.log("Python script response:", response.data);
    //         setOutput(response.data.output);
    //           if (response.data.telemetry) {
    //         setTelemetry(response.data.telemetry); // Update telemetry state
    //     }
    //         alert("Python script executed! Fetching updated telemetry...");
    //         fetchTelemetry(); // Fetch updated telemetry after script runs
    //     } catch (error) {
    //         console.error("Error starting Python script:", error);
    //         alert("Failed to start Python script.");
    //     }
    //     setLoading(false);
    // };



    //start recording bruh - sends request to start recording
    const startRecording = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('Sending start recording request...');

            const response = await axios.get('http://localhost:8888/start-recording', { //send GET request to start recroding
                withCredentials: true
            });
            
            console.log('Start recording response:', response.data);
            
            //if response = success - recording state = true and recordingStatus = recording
            if (response.data.success) {
                setRecording(true);
                setRecordingStatus('recording');
            } else {//if error - throw error
                throw new Error(response.data.error || 'Failed to start recording');
            }
        } catch (error) {
            console.error('Error starting recording:', error);
            setError(error.response?.data?.error || error.message || 'Failed to connect to server');
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
            
            console.log('Sending stop recording request...');
            const response = await axios.get('http://localhost:8888/stop-recording', { //SEnd GET request to stop
                withCredentials: true
            });
            
            console.log('Stop recording response:', response.data);//console log - debug
            
            //if successful - update recording state to false and reocrdingStatus to stopped
            if (response.data.success) { 
                setRecording(false);
                setRecordingStatus('stopped');
            } else { //if error - log error 
                throw new Error(response.data.error || 'Failed to stop recording');
            }
        } catch (error) {
            console.error('Error stopping recording:', error);
            setError(error.response?.data?.error || error.message || 'Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };


    //runs wehn component mounts to fetch telemetry data
    useEffect(() => {
        const fetchTelemetry = async () => {
            try {
                const response = await axios.get("http://localhost:8888/telemetry"); //GET request to get telemetry data from server
                console.log(response.data); //log response in console
                if (Array.isArray(response.data)) { //check if array
                    setTelemetry(response.data); //update telemetry w data received
                }
            } catch (err) { //error detected
                console.error("Error fetching telemetry:", err);
            }
        };

        fetchTelemetry();
        const interval = setInterval(fetchTelemetry, 2000); //refresh telemetry every 2 seconds
        return () => clearInterval(interval); //stop interval when component unmounts (prevent memory leak)
    }, []);

    //stylinggggggggg
    const styles = {
        container: {
            minHeight: '100vh',
            backgroundColor: 'rgb(24, 24, 27)',
            color: 'white',
        },
        contentWrapper: {
            maxWidth: '72rem',
            margin: '0 auto',
            padding: '1.5rem',
        },
        heading: {
            fontSize: '1.5rem',
            fontWeight: 'normal',
            marginBottom: '2rem',
            borderBottom: '1px solid rgb(39, 39, 42)',
            paddingBottom: '1rem',
        },
        buttonContainer: {
            marginBottom: '2rem',
            display: 'flex',
            gap: '1rem',
        },
        button: {
            padding: '0.5rem 1.5rem',
            border: '1px solid rgb(39, 39, 45)',
            backgroundColor: 'rgb(39, 39, 42)',
            color: 'white',
            cursor: 'pointer',
        },
        buttonDisabled: {
            backgroundColor: 'rgb(24, 24, 29)',
            color: 'rgb(107, 114, 128)',
            cursor: 'not-allowed',
            border: '1px solid rgb(39, 39, 41)',
        },
        telemetryList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
        },
        telemetryCard: {
            border: '1px solid rgb(39, 39, 41)',
            padding: '1.5rem',
            backgroundColor: 'rgb(39, 39, 42)',
            overflow: 'hidden', // content doesnt spill out
            width: '100%', // card takes full width of container
        },
        cardGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '2rem',
            width: '100%', // grid takes full width of card
        },
        subHeading: {
            fontSize: '1.125rem',
            marginBottom: '1rem',
            color: 'rgb(209, 213, 219)',
        },
        message: {
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            whiteSpace: 'pre-wrap', // wrap text
            wordBreak: 'break-word', // Break long words if necessary
            overflowWrap: 'break-word', //  long words don't overflow
            color: 'rgb(229, 231, 235)',
            maxWidth: '100%', // makes sure text doesn't overflow
        },
        binaryMessage: {
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            color: 'rgb(156, 163, 175)',
            maxWidth: '100%',
            marginTop: '0.5rem',
        },
        timestamp: {
            fontSize: '0.875rem',
            color: 'rgb(156, 163, 175)',
            marginTop: '1rem',
        },
        image: {
            width: '100%',
            border: '1px solid rgb(55, 65, 81)',
            maxWidth: '100%', //image doesn't overflow
            height: 'auto', // Maintain aspect ratio
        }
    };

    return (
        <div style={styles.container}>
            <Navigation />
            <div style={styles.contentWrapper}>
                <h1 style={styles.heading}>Audio Recorder</h1>
                
                <div style={styles.buttonContainer}>
                    <button 
                        style={recording || loading ? styles.buttonDisabled : styles.button} //if recording or loading = true - apply styles.buttonDisabled 
                        //else apply regular style
                        onClick={startRecording} //event handler for click envent on button
                        //when button clicked - it triggers startRecording function
                        disabled={recording || loading} //button disabled when either recording or laoding true to prevent from clicking again while recording/loading
                    >
                        {loading ? "Processing..." : recording ? "Recording..." : "Start Recording"}
                    </button>
                    <button 
                        style={!recording ? styles.buttonDisabled : styles.button} //disabled when recording is false
                        onClick={stopRecording} //even handler to trigger stopRecording when button clicked
                        disabled={!recording || loading} //recording is false oor loading is true
                    >
                        Stop Recording
                    </button>
                </div>

                <div style={styles.telemetryList}>
                    
                    {telemetry.map((entry, index) => ( //iterates over telemetry entry in telemetry array and render data
                        <div key={index} style={styles.telemetryCard}>
                            <div style={styles.cardGrid}>
                                <div>
                                    <h3 style={styles.subHeading}>Message</h3>
                                    <p style={styles.message}>
                                        {entry.message || "No message available"}
                                    </p>
                                
                                    {entry.binary_data && ( //checks if binary_data exists in current telemtry entry - if exists - render section w binary data for that entry
                                        <>
                                            <h3 style={styles.subHeading}>Binary Data</h3>
                                            <p style={styles.binaryMessage}>
                                                {entry.binary_data}
                                            </p>
                                        </>
                                    )}
                                    <p style={styles.timestamp}
                                    //converts created_at timestamp of entry into readable format
                                    >
                                        {new Date(entry.created_at).toLocaleString()}
                                    </p>
                                </div>
                                {entry.plot_path && (//checks if plot path is associated w telemetry entry
                                    <div>
                                        <h3 style={styles.subHeading}>Analysis Plot</h3>
                                        <img //if plot path exit - display image 
                                        //dynamically constructs image URL based on plot path data
                                            src={`http://localhost:8888/${entry.plot_path}`}
                                            alt="Frequency Analysis"
                                            style={styles.image}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TelemetryData;