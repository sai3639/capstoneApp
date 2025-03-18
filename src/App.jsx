import React, {useState} from "react";
import {Route, BrowserRouter as Router, Routes} from 'react-router-dom'; //handles routing 
//routes - define group of routes
//route - defines path and component that should be rendered when path is accessed
import {Home, Power, Solar, User, Antenna, TelemetryData} from './pages';



const App = () => {
  const [authenticated, setAuthenticated] = useState(false); //tracks whether user is authenicated
  const [userType, setUserType] = useState(""); //stores type of user
  const [callsign, setCallsign] = useState("")//holds user callsign

  return (
    <main className="bg-slate-300/20">
      
        <Router
        //entire routing setup enable navigation between different pages
        >
            <Routes
            //define routes 
            //each route corresponds to different URL path
            >
                <Route path="/" element={<User setAuthenticated={setAuthenticated} setUserType={setUserType} setCallsign={setCallsign}/>} />
                <Route path="/Home" element={<Home authenticated={authenticated}/>} />
                <Route path="/power" element={<Power />} />
                <Route path="/solar" element={<Solar />} />
                <Route path="/antenna" element={<Antenna userType={userType} callsign={callsign} />} />
                <Route path="/telemetry" element={<TelemetryData />}/>

            </Routes>
        </Router>
    </main>
  )
};

export default App;
