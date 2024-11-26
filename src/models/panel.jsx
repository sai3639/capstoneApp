import solarScene from '../assets/3d/panel.glb';
import { useGLTF, useAnimations, OrbitControls } from "@react-three/drei";
import { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import testScene from '../assets/3d/test.glb';

const Panel = () => {
  const solarRef = useRef();
  const {scene} = useGLTF(solarScene);

  return  (
    <mesh  scale={[50, 50, 50 ]} ref={solarRef}>
    <primitive object={scene}/>
</mesh>

  )
};

export default Panel;
