import solarScene from '../assets/3d/panel.glb';
import { useGLTF, useAnimations, OrbitControls } from "@react-three/drei";
import { useRef, useEffect, useState } from "react";


const Panel = () => {
  const solarRef = useRef(); //create refersce
  const {scene} = useGLTF(solarScene);//load

  return  (
    //scale
    <mesh  scale={[50, 50, 50 ]} ref={solarRef}>
    <primitive object={scene}/>
</mesh>

  )
};

export default Panel;
