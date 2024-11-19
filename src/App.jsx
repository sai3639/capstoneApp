import React, {useState} from "react";
import {Route, BrowserRouter as Router, Routes} from 'react-router-dom';
import {Home, Power, Solar, User, Antenna} from './pages';



const App = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [userType, setUserType] = useState("");
  const [callsign, setCallsign] = useState("")

  return (
    <main className="bg-slate-300/20">
        <Router>
            <Routes>
                <Route path="/" element={<User setAuthenticated={setAuthenticated} setUserType={setUserType} setCallsign={setCallsign}/>} />
                <Route path="/Home" element={<Home authenticated={authenticated}/>} />
                <Route path="/power" element={<Power />} />
                <Route path="/solar" element={<Solar />} />
                <Route path="/antenna" element={<Antenna userType={userType} callsign={callsign} />} />

            </Routes>
        </Router>
    </main>
  )
};

export default App;
