import { useNavigate } from 'react-router-dom';  //hook from React Router to navigate bewtween fiferrent routes 
//navigatio component to provide buttons to go to different pages
const Navigation = () => {
    const navigate = useNavigate();

    const styles = {
    //styles
        navButton: {
            backgroundColor: 'transparent',
            color: 'white', //text color
            border: 'none', //remove default border of button
            padding: '0.5rem 1rem', //add padding inside button
            margin: '0 0.5rem', 
            fontSize: '1rem',
            cursor: 'pointer',
            borderRadius: '4px', //rounded corners
            transition: 'background-color 0.2s',
            fontWeight: '500'
        },
        activeNavButton: {
            backgroundColor: '#444444'
        }
    };

    return (
        <nav>
            <button 
                style={styles.navButton} 
                className="nav-button" 
                onClick={() => navigate('/Home')} //when button clicked - navigate to home page
            >
                Home
            </button>
            <button 
                style={styles.navButton} 
                className="nav-button" 
                onClick={() => navigate('/power')} //navigate to power page (volt)
            >
                Power
            </button>
            <button 
                style={styles.navButton} 
                className="nav-button" 
                onClick={() => navigate('/solar')} //navigate to power page (watt)
            >
                Solar
            </button>
            <button 
                style={styles.navButton} 
                className="nav-button" 
                onClick={() => navigate('/antenna')} //navigate to llog page
            >
                Antenna
            </button>
            <button 
                style={styles.navButton} 
                className="nav-button" 
                onClick={() => navigate('/telemetry')} //navigate to telmetry page
            >
                Telemetry
            </button>


            <button 
                style={styles.navButton} 
                className="nav-button" 
                onClick={() => navigate('/')} //navigate to login page
            >
                Login
            </button>
        </nav>
    );
};

export default Navigation;