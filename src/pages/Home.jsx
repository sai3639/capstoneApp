//Suspense used to handle loading states
//useState/useEffect - used to manage state and side effects
import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import Loader from "../components/Loader"; //display loading animation
//react components for rendereing 3d objects
import Sky  from "../models/Sky";
import Cubes from "../models/cubes";
import axios from 'axios';
import './css/home.css';




//suspense used as a wrapper - used for rendering the loading screen 

const Home = () => {

  //state variables that help manage interactivity + store real time telemetry data
  //useState hoooks - initialize component states
  const [isRotating, setIsRotating] = useState(false); //track if cube is roating

  const[currentStage, setCurrentStage] = useState(1);
  const [latestVoltage, setLatestVoltage] = useState(null); //stores most recent voltage data

  //stores most recent power data value
  const [latestPower, setLatestPower] = useState(null);
  //stores most recent log entry from /logs
  const [latestTelemetry, setLatestTelemetry] = useState(null);


  const [isHovered, setIsHovered] = useState(false);

//fetches voltage data from /voltage endpoint
  useEffect(() => { //runs once when component mounts
    //asynchronous function - returns a promise which allows to use await
    const fetchLatestVoltage = async () => {
      //start of try block - used to handle potential errors
      try {
        //uses fetch API to make HTTP GET request 
        const response = await fetch("http://localhost:8888/api/voltages");
        //await makes javascript wait until request is complete and stores response in response
        //conversts response body (json format) into javascript obj
        //await = wait for conversion before continue
        const data = await response.json();
        //extracts latest volt from received data
        //data.voltageData = array contaiting multiple voltage readings
        //daa.voltageData.length - 1 = get index of last element (most recennt)
        const latestReading = data.voltageData[data.voltageData.length - 1];
        //cal setLatest Voltage - state updater - w latest volt

        //updates the state - triggers rerender of compondent
        setLatestVoltage(latestReading.volt);
        //if error - catch and log in console
      } catch (error) {
        console.error("Error getting voltage data:", error);
      }
    };
    ///calls fetchLatestVoltage when useEffect runs
    //ensures latest volt is fetched as soon as component mounted
    fetchLatestVoltage();
  }, [] //empty dependency array - effect runs only once 
  );


//fetches power data from /power endpoint
  useEffect(() => {
//async function
    const fetchPowerData = async () => {
        try{ //try block
          //get response using fetch API 
            const response = await axios.get("http://localhost:8888/api/power");
           
            const data = response.data; 
            //get latest power reading
            const latestReading = data.powerData[data.powerData.length - 1];
            //update state
            setLatestPower(latestReading.watt);
        
        } catch (error) { //catch error
            console.error("Error getting power data:", error);
        }
    };

    fetchPowerData();
  }, []);

  //fetches log from endpoint /logs
  useEffect(() => {
    //async function
    const fetchLatestTelemetry = async () => {
      try {
        //get data
        const response = await fetch("http://localhost:8888/api/logs");
        //convert
        const data = await response.json();
        //extract wanted data
        const latestLog = data[data.length - 1]; 
        //state update
        setLatestTelemetry(latestLog.telemetry_data); 
      } catch (error) { //catch error
        console.error("Error getting telemetry data:", error);
      }
    };
  
    fetchLatestTelemetry();
  }, []);
  




  //adjusts cube scale/position depending on window width
  const adjustCubeForScreenSize = () => {
    let screenScale = null;  //intialize scale variable
    let screenPosition = [-2, 3, -3] //set positiono of cube
    let rotation = [2, -0.5, 1 ] //set default rotation array
 
    // if screen width < 768px (mobile) - set scale to:
    if(window.innerWidth < 768){
        screenScale = [10, 10, 10];
    }
    else{
        screenScale = [10, 10 , 10];
    }

    //return adjusted scale and position values
    return [screenScale, screenPosition, rotation];


  }
//initalize cube's scale, position, and roration
 const[cubeScale, cubePosition, cubeRotation] = adjustCubeForScreenSize();


  return (
    //section element  -serves as main container
    //w-full = makes section 100% width of viewport
    //h-screen - makes sectio full  heigh of screen
    //relative - child elements positioned absolutely inside it will be relaative to this section
    <section className="w-full h-screen relative">
      
      <div className="status-box"> 

      
        <p className="title">
          Current Status
        </p>
        
        {latestVoltage !== null ? ( //checks if latestVoltage is available - if yes then show data if none then show it loading
          <p className="reading">
            Latest Voltage: {latestVoltage} V
          </p>
        ) : (
          <p className="reading">
            Loading latest voltage...
          </p>
        )}
        {latestPower !== null ? ( //displays latest power reading if there is data else loading 
          <p className="reading">
            Latest Power: {latestPower} W
          </p>
        ) : (
          <p className="reading">
            Loading latest power...
          </p>
        )}
                  {latestTelemetry !== null ? ( //displays latest log else loading
            <p className="reading">
              Latest Telemetry: {latestTelemetry}
            </p>
          ) : (
            <p className="reading">
              Loading latest telemetry...
            </p>
          )}
        <p className="reading">
          Operational Status: <span style={{ fontWeight: 'bold' }}>Standby</span>
        </p>
      </div>




      
      


        <Canvas  //3d scene;; canvas renders it
            dpr = {[1, 2]} //dpr - 1x = low performance devices; 2x for high performance (device pixel ratio)
            className={`w-full h-screen bg-transparent ${isRotating ? 'cursor-grabbing' : 'cursor-grab'}`} //3d canvs takes full width and hiegh of screen, canvas background transparent, if cube roating - curosor changes to grabbing otherwise grab
            camera={{near: 0.01, far: 1000, fov: 45}}//set camera properties - near: obj closer than 0.01 units are clipped objs farther than 1000 units are clipped; fov = field of view 
            style = {{"position": "absolute", zIndex: 1, background: 'black'}} //positions 3d canvas absolutely inside section; zIndex - ensures d scene apperas behind floating status box
            //black background
          >



            
            <Suspense fallback={<Loader />}
            //suspense component - ensures loader component is displayed while 3d models are loading
            >
            
            <directionalLight position={[10, -5, 1]} intensity={1} />
            <directionalLight position={[-5,0,-1]} intensity={0.5} />
            <ambientLight intensity={2} />
            <pointLight/>
            <spotLight />
            <hemisphereLight skyColor="#b1e1ff" groundColor="#000000" intensity={1}/>
            

            
            <Sky/>
            
           
           

            
            <Cubes
            //render Cuube component w properties
                scale={isHovered ? cubeScale.map(s => s * 1.1) : cubeScale} //controls scale - isHovered creates hover effect
                position={cubePosition} //defines position
                rotation={cubeRotation} //defines rotation
                isRotating={isRotating} //allows cube component to change issRoating state from inside itsellf - 
                setIsRotating={setIsRotating}
                setCurrentStage={setCurrentStage} //allows to change current state


            
            />


            </Suspense>

        </Canvas>




    </section>
  )
};

export default Home;
