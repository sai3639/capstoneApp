import { useGLTF, useAnimations } from "@react-three/drei"; //useGLTF is a hook that loads GLTF 3d models
import cubeScene from '../assets/3d/cubee.glb';
import { useRef, useEffect, useState } from "react"; //useREF - creates mutable references that persist between renders
import { useThree } from "@react-three/fiber"; //provides access to three.js scene, camera, and renderer
import * as THREE from 'three'; //core threejs library for 3d graphics
import { useNavigate } from 'react-router-dom'; //navigate between pages

const Cubes = ({ ...props }) => { //...props - accept and spread additional props (like scale position, rotation)
    const cubeRef = useRef(); //reference 3d cube obj
    const navigate = useNavigate(); //chang epages when clicking specifici parts of cube
    const { scene, animations } = useGLTF(cubeScene); //loads gltf model - gets 3d obj hiearchy and animation clips inside model
    const { actions } = useAnimations(animations, cubeRef); //extracts animations from model
  
    const [isHovered, setIsHovered] = useState(false); //boolean state - tracks if cube is hovered
    const [hoveredParts, setHoveredParts] = useState({}); //hoveredParts - tracks which cube parts are hovered
    const animationPlayed = useRef(false); //tracs if animation has played
  
    const componentRefs = useRef({}); //stores references to cube parts
  
    const raycaster = useRef(new THREE.Raycaster()); //detects mouse clibs on 3d objects
    const mouse = useRef(new THREE.Vector2()); //stores normalized mouse position
    const { camera, gl } = useThree(); //extracts camera and WebGL renderer
  
    //converts mouse position to range between -1 and 1
    //raycaster detects objects under mouse cursor
    const handleMouseClick = (event) => { //triggered when user clicks on screen - event parameter represents mouse event that provides details like cursor position
      //mouse.current - reference to three.js vector2 that stores mouse position
      //devent.clientx and event.clientY = mouse cursor's pixel coordinates relative to window
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1; //normalize mouse posiiton from screen coordinates 0 to width/height to range of -1 to 1
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1; //rayscasting needs this range
      //event.clientx /window.innerWidth - scales x position between 0 and 1
      //multiply by 2 and subtract by 1 shifts range form 0-1 to -1-1
      raycaster.current.setFromCamera(mouse.current, camera); //used for detecting objects under mouse curosor 
      //setFromCamera uses mouse.current (normalized posiion) and camera to cast a ray from camera through curosor position
      const intersects = raycaster.current.intersectObjects(scene.children, true); //checks which 3d objects in scene.children ray intersects
      //true = check child objects inside groups - intersects - array of objects that are hit
  
      //if raycaster detects click on 3d object
      if (intersects.length > 0) {
        const clickedObject = intersects[0].object; //gets clicked object
        console.log(`Clicked on ${clickedObject.name}`); //logs name - debug
        //$ - inserts javascripts expressions into string
        setIsHovered(false); //disables hover effect 
        //changes mouse cursosr back to default
        gl.domElement.style.cursor = 'default'; //gl - WebGL renderer rendeinr 3d scene
        //domElement - HTML canvas element where 3d scene is drawn
        
        //speciffic parts of model clicked - navigate to specific pages 
        if (clickedObject.name === "part15-2_-_Part" || clickedObject.name === "part14-1_-_Part") {
          navigate("/power"); //navigate to power page  - volts/batteries
        }
        if (clickedObject.name === "part11-1_-_Part_2") {
          navigate("/solar"); //navigate to solar page - power
        }
        if (clickedObject.name === "Hole122_-_Part_2") {
          navigate("/antenna"); //navigate to antenna page - telemetry logs
        }
      }
    };
  
    //if animation aailable - play timeline animation
    const handleCubeClick = () => { //cube click events - function triggered when user clicks cube
      if (actions) { //actions - object containing animation clips extracted from the cube model
        const action = actions['Timeline']; //gets timeline animation 
        if (action && !action.isRunning() && !animationPlayed.current) { //ensure animation exisits, prevents from playing if already running, ensures it hasnot been played before
          action.setLoop(THREE.LoopOnce); //makes animation play once instead of looping
          action.clampWhenFinished = true;//makes animation stay at final frame when end instead of resetting
          action.play(); //play animation
          animationPlayed.current = true; //prevents replay
          
          //when animation finished
          action.onFinished = () => {
            //componentRefs.current = object that stores references to various parts of the cube
            //object.values - extracts all references from object
            //loop through each reference - if not exist it makes component visiible
            Object.values(componentRefs.current).forEach((ref) => { 
              if (ref) ref.visible = true; //alll parts of cube visibible after animation finsihes
            });
          };
        }
      }
    };

    //adds click event listener when component mounts
    useEffect(() => {
      window.addEventListener('click', handleMouseClick); //attaches event listner to window object - llistens for click anywhere in browswer window
      return () => {
        window.removeEventListener('click', handleMouseClick); //removes when component unmounts 
      };
    }, []);
  

    //screen adjustmentsssss
    const adjustCubeForScreenSize = () => {
      let screenPosition = [-2, 3, -3];
      let cubeScale = [10, 10, 10];
      
      //mobile screen
      if (window.innerWidth < 768) {
        cubeScale = [6, 6, 6];
      }
  
      return [cubeScale, screenPosition];
    };
  
    const [cubeScale, cubePosition] = adjustCubeForScreenSize();
  
    return (
      //render the cube 
      <mesh
        ref={cubeRef}
        onClick={handleCubeClick} //handlle click 
        scale={isHovered ? [cubeScale[0] * 1.1, cubeScale[1] * 1.1, cubeScale[2] * 1.1] : cubeScale} //cube should increase by 10% when hovered
        position={cubePosition}
        //mouse events
        onPointerOver={() => {
          setIsHovered(true); //activates hover effects
          gl.domElement.style.cursor = 'pointer'; //change curosor to pointer
        }}
        onPointerOut={() => {
          setIsHovered(false);
          gl.domElement.style.cursor = 'default'; //change cursor to default (not pointer)
        }}
        {...props} //spread operator - pass all received props into component
      >
        
        <primitive object={scene}
        //renders imported 3d model inside cube
        > 
          {scene.children.map((child) => { //loops throuhg model parts and makes them clickable
            if (child.type === "Group") { //check if current cild is in group
              return child.children.map((part) => ( //if child is a group - lloop through individual mesh parts
                <mesh //represents 3d object
                  key={part.name} //each part needs unique key and part.name is identifier
                  ref={(el) => (componentRefs.current[part.name] = el)} //stores reference to mesh part 
                  position={part.position} //sets position to match oriiginal placement inside 3d model
                  rotation={part.rotation} //applies correct rotation to match orientation in model
                  visible={false} //starts hidden 
                  onPointerOver={() => { //triggers when mouse hovers over  part
                    setHoveredParts(prev => ({...prev, [part.name]: true})); //updates hoveredParts states -- adds current part o list of hovered parts
                    gl.domElement.style.cursor = 'pointer'; //changes curosr to pointer
                  }}
                  //removes part from hoveredParts state when mouse leaves
                  //resets cursor to normal
                  onPointerOut={() => {
                    setHoveredParts(prev => {
                      const newState = {...prev};
                      delete newState[part.name];
                      return newState;
                    });
                    gl.domElement.style.cursor = 'default';
                  }}
                  scale={hoveredParts[part.name] ? [1.1, 1.1, 1.1] : [1, 1, 1]} //if part hovered it scales up by 10%
                >
                  <primitive object={part} 
                  //render 3d obj
                  /> 
                </mesh>
              ));
            }
            return null;
          })}
        </primitive>
      </mesh>
    );
  };
  
export default Cubes;
 