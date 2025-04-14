import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import './css/user.css';

//reveives 3 props for state management
const User = ({ setAuthenticated, setUserType, setCallsign }) => {
    const [callsignInput, setCallsignInput] = useState(""); //stores temporary callsign input value
    const [error, setError] = useState("");//stoes error messaeges for display
    const navigate = useNavigate();//navigation function

    // Check for existing session on component mount
    useEffect(() => {
         //checks w backend for existing valid session cookies
        const verifySession = async () => {
        try {
            const response = await fetch("http://localhost:8888/api/verify-session", {//GET response to verify if valid session exists
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

    verifySession();
    }, []);

   

    const handleAuthenticate = async () => {
        try {
            const res = await fetch("http://localhost:8888/api/authenticate-callsign", {//sends entered callsign to backend for authentication
                method: "POST", //send POST request to backend
                headers: { "Content-Type": "application/json" }, 
                body: JSON.stringify({ callsign: callsignInput }),
                credentials: "include",
            });
            const data = await res.json();
            
            //if failure - error
            if (!res.ok) {
                console.error("Error:", res.statusText);
                setError(`Server error: ${res.statusText}`);
                return;
            }


            //if success - update state and redirect to home
            if (data.success) {
                setAuthenticated(true);
                setUserType("authenticated");
                setCallsign(callsignInput);
                navigate("/Home");
            } else {
                setError("Invalid callsign");
            }
        } catch (err) {
            setError("callsign not recognized");
        }
    };

    //authentication for guest acccess
    const guestLogin = () => {
        setAuthenticated(true);
        setUserType("guest");
        setCallsign("Guest");
        navigate("/Home"); //redirect to home page
    };

    
   
    
    return (
        <div className="contain">
            <div className="loginBox">
                <div className="header">
                    <h1 className="title">Welcome</h1>
                    <p className="subtitle">Enter your callsign</p>
                </div>
                
                <input
                    className="input"
                    type="text"
                    value={callsignInput} //binds value of input field to callsignINputvariable
                    onChange={(e) => setCallsignInput(e.target.value)}//evnent handler - triggers when user types something in input field
                    //e.target.value - refers to new value entered by user
                    //setlocalcallsign - upadates localcallsign state with new value entered
                    placeholder="Enter callsign"
                />
                
                <div className="buttonContainer">
                    <button 
                        className="authenticateButton"
                        onClick={handleAuthenticate} //event handler
                    >
                        Login
                    </button>
                    <button 
                        className="guestButton"
                        onClick={guestLogin} //event handler
                    >
                        Continue as Guest
                    </button>
                    
                </div>
                
                {error && <div className="error">{error}</div>
                //if error stat variable has any content (error message) it renders div w error message inside
                //if error state is empty - wont render anything
                } 
            </div>
        </div>
    );
};

export default User;