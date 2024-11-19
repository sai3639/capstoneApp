import { useGLTF, useAnimations, OrbitControls } from "@react-three/drei";
import { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import batteryScene from '../assets/3d/batteries.glb';








const Batteries = () => {
    const batteryRef = useRef();
    const {scene} = useGLTF(batteryScene);
  
  
    return  (
      <mesh scale={[60, 60, 50]}  rotation={[-2,3, 3]}ref={batteryRef}>
      <primitive object={scene}/>
  </mesh>
  
    )

};

export default Batteries;
