import { useGLTF, useAnimations, OrbitControls } from "@react-three/drei";
import cubeScene from '../assets/3d/cubee.glb';
import { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useAnimate, useMotionValue, useSpring } from "framer-motion";
import { motion } from 'framer-motion-3d';
import * as THREE from 'three';  // Import THREE.js
import { useNavigate } from 'react-router-dom';  // Import useNavigate



const Cubes = ({ isRotating, setIsRotating, setCurrentStage, ...props }) => {
    const cubeRef = useRef();
    const navigate = useNavigate();

    const { scene, animations } = useGLTF(cubeScene);

    const {actions} = useAnimations(animations, cubeRef);
    const [rotation, setRotation] = useState([0, 0, 0]);

    // useFrame(() => {
    //     cubeRef.current.rotation.y += 0.002; // rotation speed
    // });

   


    const handleKeyDown = (e) => {
        switch (e.key) {
            case "ArrowLeft":
                e.preventDefault();
                setRotation((prev) => [prev[0], prev[1] - 0.1, prev[2]]); // Rotate left
                break;
            case "ArrowRight":
                e.preventDefault();

                setRotation((prev) => [prev[0], prev[1] + 0.1, prev[2]]); // Rotate right
                break;
            case "ArrowUp":
                e.preventDefault();

                setRotation((prev) => [prev[0] - 0.1, prev[1], prev[2]]); // Rotate up
                break;
            case "ArrowDown":
                e.preventDefault();

                setRotation((prev) => [prev[0] + 0.1, prev[1], prev[2]]); // Rotate down
                break;
            default:
                break;
        }
    };

    // const handleCubeClick = () => {
    //     if (actions) {
    //         const action = actions['Timeline'];  
    //         if (action && !action.isRunning()) {
    //             action.play();
    //         }
    //         // if (action) {
    //         //     action.reset().play(); // Reset the animation and play it on click
    //         // }
    //     }
    // };

    const componentRefs = useRef({});

    const animationPlayed = useRef(false);
    const mouseX = useRef(0);
    const mouseY = useRef(0);
    const raycaster = useRef(new THREE.Raycaster());
    const mouse = useRef(new THREE.Vector2());
    const { camera } = useThree();



    const handleMouseClick = (event) => {
        mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.current.setFromCamera(mouse.current, camera);

        const intersects = raycaster.current.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            console.log(`Clicked on ${clickedObject.name}`); 
            
        
            if (clickedObject.name === "part15-2_-_Part" || clickedObject.name === "part14-1_-_Part" || clickedObject.name === "part15-1_-_Part") {
                navigate("/power"); // Navigate to the Power page
            }
            

            if (clickedObject.name === "part11-1_-_Part_2") {
                navigate("/solar"); // Navigate to the solar page
            }

            if (clickedObject.name === "Hole122_-_Part_2" ||  clickedObject.name === "Hole122_-_Part_3") {
                navigate("/antenna"); // Navigate to the solar page
            }


            //part11-1_-_Part_2


            //part16-2_-_Part

            //part16-1_-_Part
        }
    };

    // const handleCubeClick = () => {
    //     if (actions) {
    //         const action = actions['Timeline']; 
    //         if (action && !action.isRunning()) {
    //             action.setLoop(THREE.LoopOnce); // Play the animation only once
    //             action.clampWhenFinished = true; // Keep the last frame after the animation ends
    //             action.play();
    //             animationPlayed.current = true;
    //         }
    //     }
    // };


    const handleCubeClick = () => {
        if (actions) {
            const action = actions['Timeline'];  
            if (action && !action.isRunning() && !animationPlayed.current) {
                action.setLoop(THREE.LoopOnce);
                action.clampWhenFinished = true;
                action.play();
                animationPlayed.current = true;

                // components are interactive after animation
                action.onFinished = () => {
                    Object.values(componentRefs.current).forEach((ref) => {
                        if (ref) ref.visible = true; 
                    });
                    
                };
            }
        }
    };
    // const handleComponentClick = (componentName) => {
    //     console.log(`Clicked on ${componentName}`);
    // };

    // const handleMouseClick = (event) => {
    //     mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
    //     mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

    //     raycaster.current.setFromCamera(mouse.current, camera);

    //     const intersects = raycaster.current.intersectObjects(scene.children, true);

    //     if (intersects.length > 0) {
    //         const clickedObject = intersects[0].object;
    //         console.log(`Clicked on ${clickedObject.name}`); // Log the name of the clicked component
    //         //onclick component handler link 
    //     }
    // };

    // useEffect(() => {
    //     window.addEventListener('keydown', handleKeyDown);
    //     return() =>{
    //         window.removeEventListener('keydown', handleKeyDown)
    //     }
    // }, [])


    useEffect(() => {
        window.addEventListener('click', handleMouseClick);
        return () => {
            window.removeEventListener('click', handleMouseClick);
        };
    }, []);

    useEffect(() => {
        console.log(animations); // Log animations to the console
    }, [animations]);

    // useFrame(() => {
    //     if (cubeRef.current){
    //         cubeRef.current.rotation.set(rotation[0], rotation[1], rotation[2])
    //     }
    // })
    

    const options = { damping: 20 }

    // const mouse = {
    //     x: useSpring(useMotionValue(0), options),
    //     y: useSpring(useMotionValue(0), options)
    // }

    // const manageMouseMove = (e) => {
    //     const { innerWidth, innerHeight } = window;
    //     const { clientX, clientY } = e;
    //     const multiplier = 4;

    //     const x = (clientX / innerWidth) * multiplier;
    //     const y = (clientY / innerHeight) * multiplier;
    //     mouse.x.set(x);
    //     mouse.y.set(y);
    // }
    const manageMouseMove = (e) => {
        // Update mouse position on mouse move
        mouseX.current = e.clientX;
        mouseY.current = e.clientY;
    }

    useEffect(() => {
        window.addEventListener('mousemove', manageMouseMove);
        return () => window.removeEventListener('mousemove', manageMouseMove);
    }, []);

    // useFrame(() => {
    //     if (cubeRef.current) {
    //         // rotation based on mouse position
    //         const rotationSpeed = 0.003; 
    //         const deltaX = mouseX.current - window.innerWidth / 2; // Difference from center
    //         const deltaY = mouseY.current - window.innerHeight / 2;

    //         // Rotate around Y axis based on mouse X position
    //         cubeRef.current.rotation.y += deltaX * rotationSpeed;
    //         // Rotate around X axis based on mouse Y position
    //         cubeRef.current.rotation.x -= deltaY * rotationSpeed;

    //         cubeRef.current.rotation.x = THREE.MathUtils.clamp(cubeRef.current.rotation.x, -Math.PI / 2, Math.PI / 2);
    //     }
    // });

  
    // Set limits for the rotation angles
    const maxRotationX = Math.PI / 4;  // Limit for X-axis rotation (45 degrees)
    const maxRotationY = Math.PI / 4;  // Limit for Y-axis rotation (45 degrees)

    //            <OrbitControls enablePan={false} enableZoom={true} />

//     return (
//         <motion.primitive
//            // rotation-x={mouse.y} // Limit X-axis rotation
//             //rotation-y={mouse.x} // Limit Y-axis rotation
//             ref={cubeRef}
//             object={scene}
//             onClick={handleCubeClick}
//             //position={[2, 0, -2]}  // Ensure the cube is centered
//             {...props}
//         />
//     );
// };


//rotation={rotation}

return (
    <mesh ref={cubeRef} onClick={handleCubeClick} {...props} >
        <primitive object={scene}>
            {scene.children.map((child) => {
                if (child.type === "Group") {
                    return child.children.map((part) => (
                        <mesh
                            key={part.name}
                            ref={(el) => (componentRefs.current[part.name] = el)} 
                            position={part.position} 
                            rotation={part.rotation} 
                            visible={false} 
                        >
                            <primitive object={part} />
                        </mesh>
                    ));
                }
                return null; 
            })}
        </primitive>
    </mesh>
);
};



// return (
//     <mesh ref={cubeRef} onClick={handleCubeClick} {...props}>
//         <primitive object={scene}>
//             {scene.children.map((child) => {
//                 if (child.type === "Group") {
//                     return child.children.map((part) => (
//                         <mesh
//                             key={part.name}
//                             ref={(el) => (componentRefs.current[part.name] = el)} 
//                             position={part.position} 
//                             rotation={part.rotation} 
//                             onClick={(e) => {
//                                 e.stopPropagation(); 
//                                 handleComponentClick(part.name); 
//                             }} 
//                             visible={false} 
//                         >
//                             <primitive object={part} />
//                         </mesh>
//                     ));
//                 }
//                 return null; 
//             })}
//         </primitive>
//     </mesh>
// );
// };

export default Cubes;




  //   const handlePointerDown = (e) => {
//     e.stopPropagation();
//     e.preventDefault();
//     setIsRotating(true);

//     const clientX = e.touches ? e.touches[0].clientX : e.clientX;

//     lastX.current = clientX;
//   };

//   const handlePointerUp = (e) => {
//     e.stopPropagation();
//     e.preventDefault();
//     setIsRotating(false);
//   };

//   const handlePointerMove = (e) => {
//     e.stopPropagation();
//     e.preventDefault();

//     if (isRotating) {
//       const clientX = e.touches ? e.touches[0].clientX : e.clientX;
//       const delta = (clientX - lastX.current) / viewport.width;
//       cubeRef.current.rotation.y += delta * 0.01 * Math.PI; 
//     //   if (cubeRef.current) {
//     //     cubeRef.current.rotation.y += delta * 0.01 * Math.PI;
//     //   }

//       lastX.current = clientX;
//       rotationSpeed.current = delta * 0.01 * Math.PI;
//     }
//   };

  
//   const handleKeyDown = (e) => {
//     if(e.key === "ArrowLeft"){
//         if(!isRotating) setIsRotating(true);
//         cubeRef.current.rotation.y += 0.01 * Math.PI;
//         rotationSpeed.current = 0.0125;

//     } else if (e.key === "ArrowRight"){
//         if(!isRotating) setIsRotating(true);
//         cubeRef.current.rotation.y -= 0.01 * Math.PI;
//         rotationSpeed.current = -0.0125;

//     }
//   }

//   const handleKeyUp = (e) => {
//     if (e.key === 'ArrowLeft' || e.key === "ArrowRight") {
//       setIsRotating(false);
//     }
//   };

//   useFrame(() => {
//     if (!isRotating) {
//       rotationSpeed.current *= dampingFactor;
//       if (Math.abs(rotationSpeed.current) < 0.001) {
//         rotationSpeed.current = 0;
//       }
//       cubeRef.current.rotation.y += rotationSpeed.current;
//     } else {
//       const rotation = cubeRef.current?.rotation.y || 0;
//       const normalizedRotation = ((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

//       // Set the current stage based on the orientation
//       switch (true) {
//         case normalizedRotation >= 5.45 && normalizedRotation <= 5.85:
//           setCurrentStage(4);
//           break;
//         case normalizedRotation >= 0.85 && normalizedRotation <= 1.3:
//           setCurrentStage(3);
//           break;
//         case normalizedRotation >= 2.4 && normalizedRotation <= 2.6:
//           setCurrentStage(2);
//           break;
//         case normalizedRotation >= 4.25 && normalizedRotation <= 4.75:
//           setCurrentStage(1);
//           break;
//         default:
//           setCurrentStage(null);
//       }
//     }
//   });

//   useEffect(() => {
//     const canvas = gl.domElement;
//     // canvas.addEventListener('pointerdown', handlePointerDown);
//     // canvas.addEventListener('pointerup', handlePointerUp);
//     // canvas.addEventListener('pointermove', handlePointerMove);
//     document.addEventListener('keyup', handleKeyUp);
//     document.addEventListener('keydown', handleKeyDown);

//     return () => {
//     //   canvas.removeEventListener('pointerdown', handlePointerDown);
//     //   canvas.removeEventListener('pointerup', handlePointerUp);
//     //   canvas.removeEventListener('pointermove', handlePointerMove);
//       document.removeEventListener('keyup', handleKeyUp);
//       document.removeEventListener('keydown', handleKeyDown);
//     };
//   }, [gl]);