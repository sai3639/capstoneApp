import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Loader from "../components/Loader";
import Cube from "../models/cube";
import Sky  from "../models/Sky";
import Cubes from "../models/cubes";
import { Link } from "react-router-dom";
import axios from 'axios';




//suspense used as a wrapper - used for rendering the loading screen 

const Home = () => {

  const [isRotating, setIsRotating] = useState(false);

  const[currentStage, setCurrentStage] = useState(1);
  const [latestVoltage, setLatestVoltage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [powerData, setPowerData] = useState([]);
  const [latestPower, setLatestPower] = useState(null);
  const [latestTelemetry, setLatestTelemetry] = useState(null);


  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);


  useEffect(() => {
    const fetchLatestVoltage = async () => {
      try {
        const response = await fetch("http://localhost:8888/voltages");
        const data = await response.json();
        const latestReading = data.voltageData[data.voltageData.length - 1];
        setLatestVoltage(latestReading.volt);
      } catch (error) {
        console.error("Error fetching voltage data:", error);
      }
    };

    fetchLatestVoltage();
  }, []);

  useEffect(() => {
    const fetchPowerData = async () => {
        try{
            const response = await axios.get("http://localhost:8888/power");
           // const data = await response.json();
           const data = response.data; 
            const latestReading = data.powerData[data.powerData.length - 1];
            setLatestPower(latestReading.watt);
            // console.log("Response from /power endpoint:", response.data);  
            // if (response.data && response.data.powerData) {
            //     setPowerData(response.data.powerData);
            //     setLoading(false);
            // } else {
            //     console.warn("Unexpected response format:", response.data);
            // }
        } catch (error) {
            console.error("Error fetching power data:", error);
        }
    };

    fetchPowerData();
  }, []);


  useEffect(() => {
    const fetchLatestTelemetry = async () => {
      try {
        const response = await fetch("http://localhost:8888/logs");
        const data = await response.json();
        const latestLog = data[data.length - 1]; 
        setLatestTelemetry(latestLog.telemetry_data); 
      } catch (error) {
        console.error("Error fetching telemetry data:", error);
      }
    };
  
    fetchLatestTelemetry();
  }, []);
  




 
  const adjustCubeForScreenSize = () => {
    let screenScale = null;  
   //let screenPosition = [-1, 11, -12];  
    let screenPosition = [-2, 3, -3]
    let rotation = [2, -0.5, 1 ]

    if(window.innerWidth < 768){
        screenScale = [10, 10, 10];
    }
    else{
        screenScale = [10, 10 , 10];
    }

    return [screenScale, screenPosition, rotation];


  }

 const[cubeScale, cubePosition, cubeRotation] = adjustCubeForScreenSize();


  return (
    <section className="w-full h-screen relative">
        {/* canvas sets up entire 3d scene */}
      {/* <Link to="/power">Power</Link> */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          right: '15%',
          width: '30%',
          height: 'auto',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          fontFamily: 'monospace',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          zIndex: 10,
        }}
      >
        <p style={{ fontSize: '48px', margin: 0 }}>
          Current Status
        </p>
        {latestVoltage !== null ? (
          <p style={{ fontSize: '30px', marginTop: '20px' }}>
            Latest Voltage: {latestVoltage} V
          </p>
        ) : (
          <p style={{ fontSize: '30px', marginTop: '20px' }}>
            Loading latest voltage...
          </p>
        )}
        {latestPower !== null ? (
          <p style={{ fontSize: '30px', marginTop: '10px' }}>
            Latest Power: {latestPower} W
          </p>
        ) : (
          <p style={{ fontSize: '30px', marginTop: '10px' }}>
            Loading latest power...
          </p>
        )}
                  {latestTelemetry !== null ? (
            <p style={{ fontSize: '30px', marginTop: '10px' }}>
              Latest Telemetry: {latestTelemetry}
            </p>
          ) : (
            <p style={{ fontSize: '30px', marginTop: '10px' }}>
              Loading latest telemetry...
            </p>
          )}
        <p style={{ fontSize: '30px', marginTop: '10px' }}>
          Operational Status: <span style={{ fontWeight: 'bold' }}>Standby</span>
        </p>
      </div>




      
      


        <Canvas 
            dpr = {[1, 2]}
            className={`w-full h-screen bg-transparent ${isRotating ? 'cursor-grabbing' : 'crusor-grab'}`} 
            camera={{near: 0.01, far: 1000, fov: 45}}
            style = {{"position": "absolute", zIndex: 1, background: 'black'}}

            
            
           //camera={{fov: 4}}
        >



            <Suspense fallback={<Loader />}>
            
            <directionalLight position={[10, -5, 1]} intensity={1} />
            <directionalLight position={[-5,0,-1]} intensity={0.5} />
            <ambientLight intensity={2} />
            <pointLight/>
            <spotLight />
            <hemisphereLight skyColor="#b1e1ff" groundColor="#000000" intensity={1}/>
            

            <Sky
                //scale = {[100, 100, 100]}
            />
            
           
            {/* <OrbitControls enableZoom={false} enablePan={false} /> */}
            {/* <OrbitControls enableZoom={true} enablePan={true} /> */}

            <Cubes
                scale={isHovered ? cubeScale.map(s => s * 1.1) : cubeScale}
                position={cubePosition}
                rotation={cubeRotation}
                isRotating={isRotating}
                setIsRotating={setIsRotating}
                setCurrentStage={setCurrentStage}
                // onPointerOver={() => !isClicked && setIsHovered(true)} 
                // onPointerOut={() => !isClicked && setIsHovered(false)}
                // onClick={() => setIsClicked(true)}

            
            />

            

            {/* <Cube 
                position = {cubePosition}
                scale = {cubeScale}
                //scale ={[5, 5, 5]}
                rotation = {cubeRotation}
            /> */}


            </Suspense>

        </Canvas>




    </section>
  )
};

export default Home;
//  <NavLink to="/about" className={({isActive}) => isActive ?
// 'text-blue-500': 'text-black'}>
// About
// </NavLink>