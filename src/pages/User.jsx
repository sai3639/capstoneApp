import { useState } from "react";
import { useNavigate } from 'react-router-dom';  



const User = ({ setAuthenticated, setUserType, setCallsign }) => {
   // const [callsign, setCallsign] = useState("");
    const [localCallsign, setLocalCallsign] = useState(""); 
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleAuthenticate = async () => {
        try {
            const response = await fetch("http://localhost:8888/authenticate-callsign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ callsign: localCallsign })
            });
            const data = await response.json();
            if (!response.ok) {
                console.error("Error from backend:", response.statusText);
                setError(`Server error: ${response.statusText}`);
            }
            

            console.log("Backend Response:", data);

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


    const handleGuestLogin = () => {
        setAuthenticated(true);
        setUserType("guest");
        setCallsign("Guest");
        navigate("/Home");
    };

    
    const styles = {
        container: {
            minHeight: '100vh',
            backgroundColor: '#1a1a2e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        },
        loginBox: {
            backgroundColor: '#282840',
            padding: '3rem', 
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: '500px', 
            border: '1px solid #3a3a5c'
        },
        header: {
            textAlign: 'center',
            marginBottom: '2rem'
        },
        title: {
            color: 'white',
            fontSize: '2.5rem',  
            fontWeight: 'bold',
            marginBottom: '0.5rem'
        },
        subtitle: {
            color: '#b3b3cc'
        },
        input: {
            width: '100%',
            padding: '1rem',  
            marginBottom: '1.5rem',  
            backgroundColor: '#1e1e30',
            border: '1px solid #3a3a5c',
            borderRadius: '4px',
            color: 'white',
            fontSize: '1.2rem'  
        },
        buttonContainer: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'  
        },
        authenticateButton: {
            padding: '1rem', 
            backgroundColor: '#4a90e2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1.2rem',  
            cursor: 'pointer',
            transition: 'background-color 0.2s'
        },
        guestButton: {
            padding: '1rem',  
            backgroundColor: '#282840',
            color: 'white',
            border: '1px solid #4a90e2',
            borderRadius: '4px',
            fontSize: '1.2rem',  
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
                    <h1 style={styles.title}>CubeSat Ground Control</h1>
                    <p style={styles.subtitle}>Enter your callsign to log telemtry data</p>
                </div>

                <input
                    type="text"
                    placeholder="Enter Callsign"
                    value={localCallsign}
                    onChange={(e) => setLocalCallsign(e.target.value)}
                    style={styles.input}
                />

                <div style={styles.buttonContainer}>
                    <button 
                        onClick={handleAuthenticate}
                        style={styles.authenticateButton}
                        onMouseOver={e => e.target.style.backgroundColor = '#357abd'}
                        onMouseOut={e => e.target.style.backgroundColor = '#4a90e2'}
                    >
                        Authenticate
                    </button>

                    <button 
                        onClick={handleGuestLogin}
                        style={styles.guestButton}
                        onMouseOver={e => e.target.style.backgroundColor = '#1e1e30'}
                        onMouseOut={e => e.target.style.backgroundColor = '#282840'}
                    >
                        Continue as Guest
                    </button>
                </div>

                {error && <div style={styles.error}>{error}</div>}
            </div>
        </div>
    );
};

export default User;

