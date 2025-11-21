import React, { useRef, useContext, useMemo, useEffect } from 'react'
import { getMaxVals } from '../helpers/index'
import { RigidBody, InstancedRigidBodies } from "@react-three/rapier"
import RopeJointBetween from "./RopeJointBetween"
import Tube from "./Tube"
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

import ThreedyContext from '../context/ThreedyPointsContext'


const ChainCylinders = ({ parts, setOrbitControls, focusPath, updatePoints, updateTimestamp, setIsDragging }) => {
    //setting up hooks

    const bodyRefs = useRef([])
    const hasNastyVals = useRef(false)
    const bodyType = useRef('fixed')
    const { dampingRef, timestampRef } = useContext(ThreedyContext)
    
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

    if(bodyRefs.current.length !== parts.length) {
        bodyRefs.current = Array(parts.length).fill().map((_, i) => {
            // return bodyRefs.current[i] || React.createRef(null)
            if(bodyRefs.current[i]) {
                return bodyRefs.current[i]
            }
            else {
                console.log(`whoops there are nasty vals`)
                hasNastyVals.current = true
                return React.createRef(null)
            }
        })
    }

    if(hasNastyVals.current) {
        // console.log(bodyRefs.current)
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

    }, [parts])
    useEffect(() => {
        bodyType.current = 'fixed'
        const { maxVals } = getPtsAndMaxVals()
        focusPath(maxVals)
        setTimeout(() => { bodyType.current = 'dynamic' }, 100)        
    }, [parts])

    useEffect(() => {
        const handlePointerUp =  () => { 
            setOrbitControls(true); 
            if(draggingIndexRef.current > 0) {
                
                draggingIndexRef.current = -1;
                setIsDragging(false)
                updateTimestamp()
            }
        }
        window.addEventListener('pointerup', handlePointerUp)
        return () => window.removeEventListener('pointerup', handlePointerUp)
    }, [])


    // this costs a billion dollars
    useFrame(({ camera, mouse: mousePos}) => {
        const body = bodyRefs.current[draggingIndexRef.current]

        const pts = bodyRefs.current.map((body) => {
            return body.current?.translation()
        })
        const elapsed = performance.now() - timestampRef.current;
        if (elapsed > 10000) return
        updatePoints(pts)
        if(!body) return
        updateTimestamp()
        

        raycaster.current.setFromCamera(mousePos, camera)
        const target = new THREE.Vector3(0,0,0)

        raycaster.current.ray.intersectPlane(plane, target)

        const current = body.current?.translation()
        const force = new THREE.Vector3().subVectors(target, current).multiplyScalar(30)
        // console.log({ force })
        
        body.current?.applyImpulse(force, true)
    })

    const dragClosestRigidBody = (e) => {
        updateTimestamp()
        setOrbitControls(false);
        // console.log(`ummm`)
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
                    <RigidBody ref={bodyRefs.current[index]} linearDamping={4} canSleep
                       position={position} type={bodyType.current} colliders={"cuboid"} sensor>
                        <mesh key={`mesh_${index}`} rotation={rotation} >
                            <boxGeometry args={[partLength,0.5,10]} />
                            <meshStandardMaterial 
                            transparent opacity={0}
                            />
                        </mesh>
                    </RigidBody>
                    {index > 0 && index < parts.length ?  
                        <RopeJointBetween
                        key={dampingRef.current}
                            length={partLength}
                            bodyA={bodyRefs.current[index]}
                            bodyB={bodyRefs.current[index -1]}
                            stiffness={draggingIndexRef.current > 0 ? 10 : 10000}
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