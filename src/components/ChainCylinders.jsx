import React, { useRef, useState, useMemo, useEffect } from 'react'
import { getMaxVals } from '../helpers/index'
import { RigidBody, InstancedRigidBodies } from "@react-three/rapier"
import RopeJointBetween from "./RopeJointBetween"
import Tube from "./Tube"
import * as THREE from 'three'
import { extend, useFrame } from '@react-three/fiber'
import { toonShader } from '../helpers/shaders'

const ChainCylinders = ({ parts, damping, setOrbitControls, focusPath, updatePoints }) => {
    //setting up hooks
    const[points,setPoints] = useState([])
    // const [draggingIndex, setDraggingIndex] = useState(-1)
    const [isDragging, setIsDragging] = useState(false)
    const [offset, setOffset] = useState({x: 0, y: 0})

    const bodyRefs = useRef([])
    const pointsRef = useRef([])

    const dampingRef = useRef(damping)
    
    const draggingIndexRef = useRef(-1)
    
    const raycaster = useRef(new THREE.Raycaster())
    const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0,0,1), 0), [])

    if(bodyRefs.current.length !== parts.length) {
        bodyRefs.current = Array(parts.length).fill().map((_, i) => bodyRefs.current[i] || React.createRef(null))
    }

    // useeffect zone
    useEffect(() => {
        const _pts = bodyRefs.current.map(ref => {
            const pos = ref.current?.translation()
            return pos ? new THREE.Vector3(pos.x, pos.y, pos.z) : new THREE.Vector3()
        })
        

        const maxVals = getMaxVals(_pts)
        const avgX = (maxVals?.maxX + maxVals?.minX) / 2
        const avgY = (maxVals?.maxY + maxVals?.minY) / 2

        const newPts = _pts.map(pt => new THREE.Vector3(pt.x - avgX, pt.y - avgY, pt.z))
        pointsRef.current = newPts

        setOffset({x: avgX ? avgX : 0, y: avgY ? avgY : 0})
        focusPath(maxVals)

    }, [parts])

    useEffect(() => {
        dampingRef.current = parseInt(damping)
        console.log(damping)
    }, [damping])

    useEffect(() => {
        const handlePointerUp = () => { 
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
                setTimeout(() => setIsDragging(false), timeoutLength)
            }
        }
        window.addEventListener('pointerup', handlePointerUp)
        return () => window.removeEventListener('pointerup', handlePointerUp)
    }, [])


    // this costs a billion dollars
    useFrame(({ camera, mouse: mousePos}) => {
        const body = bodyRefs.current[draggingIndexRef.current]

        
        if(!isDragging) return
        const pts = bodyRefs.current.map((body) => {
            return body.current.translation()
        })
        updatePoints(pts)
        if(!body) return

        raycaster.current.setFromCamera(mousePos, camera)
        const target = new THREE.Vector3(0,0,0)

        raycaster.current.ray.intersectPlane(plane, target)

        const current = body.current?.translation()
        const force = new THREE.Vector3().subVectors(target, current).multiplyScalar(30)

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

    return (
        <>
        {parts.map((part, index) => {
            const point = points[index]
            
            const midX = point?.x ? point.x : (part.start.x + part.end.x) / 2 - offset.x
            const midY = point?.y ? point.y : (part.start.y + part.end.y) / 2 - offset.y
            // const z = point?.z ? point.z : 0
            const z = 0

            const position = [ midX, midY, z]
            const rotation = [0,0, part.angle]

            return (
                <group>
                    <RigidBody key={index} ref={bodyRefs.current[index]} linearDamping={damping}
                               position={position} type="dynamic" colliders="cuboid" name={`chain_${index}`}>
                        <mesh key={index} rotation={rotation} >
                            <boxGeometry args={[part.length,0.1,10]} />
                            {/* <sphereGeometry args={[part.length,1,1]} /> */}
                            {/* <cylinderGeometry args={[2, 2, part.length, 9]} /> */}

                            <meshStandardMaterial 
                            // color={draggingIndexRef.current === index ? 'red' : 'black'}
                            transparent opacity={0}
                            />
                        </mesh>
                    </RigidBody>
                    {console.log({index, pl: parts.length})}
                    {index > 0 && index < parts.length ?  
                        <RopeJointBetween
                            key={`joint-${index}`}
                            length={part.length}
                            bodyA={bodyRefs.current[index]}
                            bodyB={bodyRefs.current[index -1]}
                            index={index}
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