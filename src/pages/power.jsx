import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Canvas } from '@react-three/fiber';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import Batteries from '../models/batteries.jsx';
import { OrbitControls, PresentationControls } from "@react-three/drei";


const Power = () => {

    const [voltageData, setVoltageData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [warning, setWarning] = useState(false);


    const adjustBatteriesForScreenSize = () => {
        let screenScale = null;  
       //let screenPosition = [-1, 11, -12];  
        let screenPosition = [-2, 3, -3]
        let rotation = [-2, -0.5, 1 ]
    
        if(window.innerWidth < 768){
            screenScale = [10, 10, 10];
        }
        else{
            screenScale = [10, 10 , 10];
        }
    
        return [screenScale, screenPosition, rotation];
    
    
      }
    
     const[batteriesScale, batteriesPosition, batteriesRotation] = adjustBatteriesForScreenSize();



    useEffect(() => {
        const fetchVoltageData = async () => {
            try {
                const response = await axios.get('http://localhost:8888/voltages');
                const data = response.data.voltageData;

                if (data.some(record => record.volt === 7)) {
                    window.alert('Voltage Warning!');
                }

                setVoltageData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchVoltageData();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    // Prepare chart data
    const chartData = {
        labels: voltageData.map(data => new Date(data.created_at).toLocaleString()),
        datasets: [{
            label: 'Voltage (V)',
            data: voltageData.map(data => data.volt),
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: true,
            tension: 0.4,
        }],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: { display: true, text: 'Date/Time' }
            },
            y: {
                title: { display: true, text: 'Voltage (V)' },
                beginAtZero: true,
                max: 10,
            }
        }
    };


//add scrolling feature on table - make font bigger
//less values on graph? - more legible 

    return (
        <div style={{ display: 'flex', padding: '20px', fontSize: '18px' }}>
        <div style={{ flex: '1', maxWidth: '50%', marginRight: '20px' }}>
            <h1 style={{ fontSize: '28px' }}>Voltage Data</h1>
            <div style={{ maxHeight: '500px', overflowY: 'auto', border: '2px solid black', marginBottom: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '24px' }}>
                    <thead>
                        <tr>
                            <th style={{ border: '2px solid black', padding: '12px', backgroundColor: '#f0f0f0' }}>Voltage</th>
                            <th style={{ border: '2px solid black', padding: '12px', backgroundColor: '#f0f0f0' }}>Message</th>
                            <th style={{ border: '2px solid black', padding: '12px', backgroundColor: '#f0f0f0' }}>Date/Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {voltageData.map((data) => (
                            <tr key={data.id}>
                                <td style={{ border: '2px solid black', padding: '12px' }}>{data.volt} V</td>
                                <td style={{ border: '2px solid black', padding: '12px' }}>{data.message}</td>
                                <td style={{ border: '2px solid black', padding: '12px' }}>{new Date(data.created_at).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
       
            <Canvas style={{ width: '100%', height: '700px', padding:'50px', right:'100px', top: '200px' }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[15, -5, 1]} intensity={0.5} />
                <directionalLight position={[4, -5, 1]} intensity={0.5} />
                <directionalLight position={[4, -3, 1]} intensity={0.5} />


                <Batteries position={batteriesPosition}
                    scale={batteriesScale}
                    rotation={batteriesRotation}
                   
                 />
                 <OrbitControls/>
            </Canvas>
       
        </div>

        <div style={{ flex: '1', marginTop: '20px' }}>
            <h2 style={{ fontSize: '28px' }}>Voltage over Time</h2>
            <div style={{ height: '75%', width: '100%' }}>
                <Line data={chartData} options={options} />
            </div>
        </div>
    </div>
    );
};

export default Power;
