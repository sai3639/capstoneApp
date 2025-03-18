import { useGLTF } from "@react-three/drei";
import { useRef} from "react";
import batteryScene from '../assets/3d/batteries.glb';
//useGLTF - used to lad 3d model








const Batteries = () => {
    const batteryRef = useRef(); //creates reference to 3d model
    //loads glb file and reutrns object containing gltf scene
    //extract scene object
    const {scene} = useGLTF(batteryScene);
  
  
    return  (
      //render 3d model
      //scale - size of model
      ///rotationi - orientation
      <mesh scale={[60, 60, 50]}  rotation={[-2,3, 3]}ref={batteryRef}>
      <primitive object={scene}/>
  </mesh>
  
    )

};

export default Batteries;
