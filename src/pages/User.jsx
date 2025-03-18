import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

//reveives 3 props for state management
const User = ({ setAuthenticated, setUserType, setCallsign }) => {
    const [localCallsign, setLocalCallsign] = useState(""); //stores temporary callsign input value
    const [error, setError] = useState("");//stoes error messaeges for display
    const navigate = useNavigate();//navigation function

    // Check for existing session on component mount
    useEffect(() => {
        checkExistingSession(); 
    }, []);

    //checks w backend for existing valid session cookies
    const checkExistingSession = async () => {
        try {
            const response = await fetch("http://localhost:8888/verify-session", {//GET response to verify if valid session exists
                credentials: "include"//include cookies
            });
            const data = await response.json();

            //if valid session exist
            if (data.success) {
                setAuthenticated(true); //update authentication state
                setUserType("authenticated"); //set user type to authenticated
                setCallsign(data.callsign);//sets callsign from server response
                navigate("/Home");//redirect to home page
            }
        } catch (err) {//catch error
            console.error("Session verification error:", err);
        }
    };

    const handleAuthenticate = async () => {
        try {
            const response = await fetch("http://localhost:8888/authenticate-callsign", {//sends entered callsign to backend for authentication
                method: "POST", //send POST request to backend
                headers: { "Content-Type": "application/json" }, 
                body: JSON.stringify({ callsign: localCallsign }),
                credentials: "include",
            });
            const data = await response.json();
            
            //if failure - error
            if (!response.ok) {
                console.error("Error from backend:", response.statusText);
                setError(`Server error: ${response.statusText}`);
                return;
            }

            console.log("Backend Response:", data); //debug

            //if success - update state and redirect to home
            if (data.success) {
                setAuthenticated(true);
                setUserType("authenticated");
                setCallsign(localCallsign);
                navigate("/Home");
            } else {
                setError("Invalid callsign");
            }
        } catch (err) {
            setError("Error checking callsign");
        }
    };

    //authentication for guest acccess
    const handleGuestLogin = () => {
        setAuthenticated(true);
        setUserType("guest");
        setCallsign("Guest");
        navigate("/Home"); //redirect to home page
    };

    
    const styles = {
        container: {
            minHeight: '100vh',
            backgroundColor: '#1e1e1e', // Dark grey background
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        },
        loginBox: {
            backgroundColor: '#2a2a2a', // Slightly lighter grey for contrast
            padding: '3rem', 
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: '400px', 
            border: '1px solid #3a3a3a'
        },
        header: {
            textAlign: 'center',
            marginBottom: '2rem'
        },
        title: {
            color: 'white',
            fontSize: '2rem',  
            fontWeight: 'bold',
            marginBottom: '0.5rem'
        },
        subtitle: {
            color: '#cccccc' // Light grey for subtitle
        },
        input: {
            width: '100%',
            padding: '0.75rem',  
            marginBottom: '1.5rem',  
            backgroundColor: '#333333', // Input background
            border: '1px solid #444444',
            borderRadius: '4px',
            color: 'white',
            fontSize: '1rem'  
        },
        buttonContainer: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'  
        },
        authenticateButton: {
            padding: '0.75rem', 
            backgroundColor: '#444444', // Dark grey button
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',  
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            fontWeight: 'bold'
        },
        guestButton: {
            padding: '0.75rem',  
            backgroundColor: 'transparent',
            color: 'white',
            border: '1px solid #444444',
            borderRadius: '4px',
            fontSize: '1rem',  
            cursor: 'pointer',
            transition: 'background-color 0.2s'
        },
        error: {
            color: '#ff4d4d',
            backgroundColor: 'rgba(255, 77, 77, 0.1)',
            padding: '0.75rem',
            borderRadius: '4px',
            textAlign: 'center',
            marginTop: '1rem'
        }
    };
    
    return (
        <div style={styles.container}>
            <div style={styles.loginBox}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Welcome</h1>
                    <p style={styles.subtitle}>Please enter your callsign to continue</p>
                </div>
                
                <input
                    style={styles.input}
                    type="text"
                    value={localCallsign} //binds value of input field to localcallsign variable
                    onChange={(e) => setLocalCallsign(e.target.value)}//evnent handler - triggers when user types something in input field
                    //e.target.value - refers to new value entered by user
                    //setlocalcallsign - upadates localcallsign state with new value entered
                    placeholder="Enter callsign"
                />
                
                <div style={styles.buttonContainer}>
                    <button 
                        style={styles.authenticateButton} 
                        onClick={handleAuthenticate} //event handler
                    >
                        Login
                    </button>
                    <button 
                        style={styles.guestButton} 
                        onClick={handleGuestLogin} //event handler
                    >
                        Continue as Guest
                    </button>
                    
                </div>
                
                {error && <div style={styles.error}>{error}</div>
                //if error stat variable has any content (error message) it renders div w error message inside
                //if error state is empty - wont render anything
                } 
            </div>
        </div>
    );
};

export default User;