import { useNavigate } from 'react-router-dom';
//logout component
const Logout = ({ setAuthenticated, setUserType, setCallsign }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            // Clear the session cookie on the server
            await fetch("http://localhost:8888/logout", {
                method: "POST",
                credentials: "include"
            });

            // Clear the authentication state
            setAuthenticated(false);
            setUserType(null);
            setCallsign(null);
            
            // Navigate to login page
            navigate("/");
        } catch (err) {
            console.error("Logout error:", err);
        }
    };

    return (
        <button onClick={handleLogout}>
            Logout
        </button>
    );
};

export default Logout;