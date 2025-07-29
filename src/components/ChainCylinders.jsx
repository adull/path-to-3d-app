import React, { useRef, useState, useContext, useMemo, useEffect } from 'react'
import { getMaxVals } from '../helpers/index'
import { RigidBody, InstancedRigidBodies } from "@react-three/rapier"
import RopeJointBetween from "./RopeJointBetween"
import Tube from "./Tube"
import * as THREE from 'three'
import { extend, useFrame } from '@react-three/fiber'
import { toonShader } from '../helpers/shaders'

import DampingContext from '../context/DampingContext'


const ChainCylinders = ({ parts, setOrbitControls, focusPath, updatePoints, setIsDragging }) => {
    //setting up hooks
    // const [isDragging, setIsDragging] = useState(false)
    const [jointSize, setJointSize] = useState(0.1)

    const bodyRefs = useRef([])
    const bodyType = useRef('fixed')
    const dampingRef = useContext(DampingContext)

    // const dampingRef = useRef(damping)
    
    const draggingIndexRef = useRef(-1)
    
    const raycaster = useRef(new THREE.Raycaster())
    const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0,0,1), 0), [])
    
    const getPtsAndMaxVals = () => {
        const points = bodyRefs.current.map(ref => {
            const pos = ref.current?.translation()
            return pos ? new THREE.Vector3(pos.x, pos.y, pos.z) : new THREE.Vector3()
        })

        const maxVals = getMaxVals(points)
        return { points, maxVals }
    }

    const setOffset = (points, maxVals) => {
        // console.log({ maxVals })
        const avgX = (maxVals?.maxX + maxVals?.minX) / 2
        const avgY = (maxVals?.maxY + maxVals?.minY) / 2

        // const newPts = points.map(pt => new THREE.Vector3(pt.x - avgX, pt.y - avgY, pt.z))
        // console.log({ newPts })
        // pointsRef.current = newPts

        // console.log({ x: avgX ? avgX : 0, y: avgY ? avgY : 0 })

        return { x: avgX ? avgX : 0, y: avgY ? avgY : 0 }
        // offsetRef.current = { x: avgX ? avgX : 0, y: avgY ? avgY : 0 }
    }

    if(bodyRefs.current.length !== parts.length) {
        bodyRefs.current = Array(parts.length).fill().map((_, i) => bodyRefs.current[i] || React.createRef(null))
    }


    const offset = useMemo(() => {
        if (!parts.length) return { x: 0, y: 0 };
        const points = parts.map(part => {
            const pos = {x: (part.start.x + part.end.x) /2, y: (part.start.y + part.end.y) /2}
            // console.log(pos)
            return pos
        })
        const maxVals = getMaxVals(points)
        const avgX = (maxVals?.maxX + maxVals?.minX) / 2
        const avgY = (maxVals?.maxY + maxVals?.minY) / 2

        return { x: avgX ? avgX : 0, y: avgY ? avgY : 0 }

        
        // return { x: 0, y: 0}

    }, [parts])
    // const offset = { x: 0, y: 0}
    // useeffect zone
    useEffect(() => {
        bodyType.current = 'fixed'
        const {points, maxVals} = getPtsAndMaxVals()
        focusPath(maxVals)
        setTimeout(() => { bodyType.current = 'dynamic'}, 100)        
    }, [parts])

    // useEffect(() => {
    //     console.log(`isdrawinggg`)
    //     if(isDrawing) {
    //         setJointSize(100)
    //     } else {
    //         setJointSize(0.1)
    //     }
    // },[isDrawing])

    // useEffect(() => {
    //     console.log(triggerRerender)
    //     hack(triggerRerender + 1)
    // }, [triggerRerender])

    // useEffect(() => {
    //     dampingRef.current = parseInt(damping)
    // }, [damping])

    useEffect(() => {
        const handlePointerUp =  () => { 
            setOrbitControls(true); 
            if(draggingIndexRef.current > 0) {
                
                draggingIndexRef.current = -1;
                const timeoutMap = {
                    1: 5000,
                    2: 3500,
                    3: 1250,
                    4: 750
                }
                const timeoutIndex = dampingRef.current < 4 ? dampingRef.current : 4
                const timeoutLength = timeoutMap[timeoutIndex]
                //  setTimeout(() => setIsDragging(false), timeoutLength)
                setIsDragging(false)
            }
        }
        window.addEventListener('pointerup', handlePointerUp)
        return () => window.removeEventListener('pointerup', handlePointerUp)
    }, [])


    // this costs a billion dollars
    useFrame(({ camera, mouse: mousePos}) => {
        const body = bodyRefs.current[draggingIndexRef.current]

        const pts = bodyRefs.current.map((body) => {
            return body.current.translation()

            // if(!body?.current?.translation()) {
            //     return body.current.translation()
            // }
            // return { x: 0, y: 0, z: 0}
        })
        updatePoints(pts)
        if(!body) return

        raycaster.current.setFromCamera(mousePos, camera)
        const target = new THREE.Vector3(0,0,0)

        raycaster.current.ray.intersectPlane(plane, target)

        const current = body.current?.translation()
        const force = new THREE.Vector3().subVectors(target, current).multiplyScalar(30)
        // console.log({ force })
        
        body.current?.applyImpulse(force, true)
    })

    const dragClosestRigidBody = (e) => {
        setOrbitControls(false);
        setIsDragging(true)
      
        const virtualPoint = e.point;
        let closestIndex = -1;
        let minDistance = Infinity;
      
        // pointsRef.current.forEach((point, index) => {
        bodyRefs.current.forEach((body, index) => {
          const point = body.current.translation()
          const dx = point.x - virtualPoint.x;
          const dy = point.y - virtualPoint.y;
          const dz = point.z - virtualPoint.z;
      
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        // const distance = Math.sqrt(dx * dx + dy * dy);


          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = index;
          }
        });

        draggingIndexRef.current = closestIndex
      };
    //   console.log(`chain culinders rerender`)
    return (
        <>
        {parts.map((part, index) => {
            const midX = (part.start.x + part.end.x) / 2 - offset.x
            const midY = (part.start.y + part.end.y) / 2 - offset.y
            const z = 0

            const position = [ midX, midY, z]
            const rotation = [0,0, part.angle]
            const partLength = part.length > 20 ? 20 : part.length
            
            return (
                <group key={`rigidBody_${index}`}>
                    <RigidBody ref={bodyRefs.current[index]} linearDamping={dampingRef.current} canSleep
                       position={position} type={bodyType.current} colliders={"cuboid"} sensor>
                        <mesh key={`mesh_${index}`} rotation={rotation} >
                            <boxGeometry args={[partLength,0.3,10]} />
                            <meshStandardMaterial 
                            transparent opacity={0}
                            />
                        </mesh>
                    </RigidBody>
                    {index > 0 && index < parts.length ?  
                        <RopeJointBetween
                            length={partLength}
                            bodyA={bodyRefs.current[index]}
                            bodyB={bodyRefs.current[index -1]}
                        />
                        :
                        <></>
                    }
                </group>
            )
        })}
        <Tube onDrag={dragClosestRigidBody} bodyRefs={bodyRefs.current} />
        </>
    )
}

export default ChainCylinders