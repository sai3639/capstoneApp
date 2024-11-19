import { useGLTF } from "@react-three/drei";
import { useRef, useEffect } from "react";
import skyScene from '../assets/3d/stars.glb';
import { useFrame } from "@react-three/fiber";

const Sky = () => {
    const skyRef = useRef();

    // Rotate the sky continuously
    useFrame(() => {
        skyRef.current.rotation.y += 0.002; // rotation speed
    });

    const { scene } = useGLTF(skyScene);

    return (
        <mesh ref={skyRef}>
            <primitive object={scene} />
        </mesh>
    );
};

export default Sky;
