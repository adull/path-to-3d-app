import React, { useRef, useState, useMemo, useEffect } from 'react'
import { getMaxVals } from '../helpers/index'
import { shaderMaterial } from '@react-three/drei'
import { RigidBody, InstancedRigidBodies } from "@react-three/rapier"
import RopeJointBetween from "./RopeJointBetween"
import * as THREE from 'three'
import { extend, useFrame } from '@react-three/fiber'
import { toonShader } from '../helpers/shaders'

const ChainCylinders = ({ parts, setOrbitControls, focusPath, updatePoints }) => {
    //setting up hooks
    const[points,setPoints] = useState([])
    const [draggingIndex, setDraggingIndex] = useState(-1)
    const [offset, setOffset] = useState({x: 0, y: 0})

    const tubeRef = useRef(null)
    const pointsRef = useRef(null)
    const bodyRefs = useRef([])
    
    const raycaster = useRef(new THREE.Raycaster())
    const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0,0,1), 0), [])

    if(bodyRefs.current.length !== parts.length) {
        bodyRefs.current = Array(parts.length).fill().map((_, i) => bodyRefs.current[i] || React.createRef(null))
        

        setPoints(bodyRefs.current.map(ref => {
            const pos = ref.current?.translation()
            return pos ? new THREE.Vector3(pos.x, pos.y, pos.z) : new THREE.Vector3()
        }))
    }
    // console.log(parts)

    useEffect(() => {
        
        pointsRef.current = points

    }, [points])
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

        setOffset({x: avgX ? avgX : 0, y: avgY ? avgY : 0})
        setPoints(newPts)
        focusPath(maxVals)


    }, [parts])

    useEffect(() => {
        // console.log(`umm`)
        const handlePointerUp = () => { setOrbitControls(true); setDraggingIndex(-1); setTimeout(() => updatePoints(pointsRef.current), 550 )}
        window.addEventListener('pointerup', handlePointerUp)
        return () => window.removeEventListener('pointerup', handlePointerUp)
    }, [])


    // this costs a billion dollars
    useFrame(({ camera, mouse: mousePos}) => {
        // setPoints(bodyRefs.current.map(ref => {
        //     const pos = ref.current?.translation()
        //     return pos ? new THREE.Vector3(pos.x, pos.y, pos.z) : new THREE.Vector3()
        // }))

        const _pts = bodyRefs.current.map(ref => {
            const pos = ref.current?.translation()
            return pos ? new THREE.Vector3(pos.x, pos.y, pos.z) : new THREE.Vector3()
        })
        

        const maxVals = getMaxVals(_pts)
        const avgX = (maxVals?.maxX + maxVals?.minX) / 2
        const avgY = (maxVals?.maxY + maxVals?.minY) / 2

        const newPts = _pts.map(pt => new THREE.Vector3(pt.x - avgX, pt.y - avgY, pt.z))

        setPoints(newPts)

        if(draggingIndex === -1) return
        // console.log({ draggingIndex })

        const body = bodyRefs.current[draggingIndex]
        // console.log({ body })

        if(!body) return

        raycaster.current.setFromCamera(mousePos, camera)
        const target = new THREE.Vector3(0,0,0)

        raycaster.current.ray.intersectPlane(plane, target)

        const current = body.current?.translation()
        const force = new THREE.Vector3().subVectors(target, current).multiplyScalar(20)

        body.current?.applyImpulse(force, true)
        // updatePoints(newPts)

    })

    const dragClosestRigidBody = (e) => {
        console.log(`on`)
        setOrbitControls(false);
      
        const virtualPoint = e.point;
        console.log({ virtualPoint })
        let closestIndex = -1;
        let minDistance = Infinity;

        // console.log({ parts })
        // console.log({ points })
      
        points.forEach((point, index) => {
        //   const point = { x: (part.start.x + part.end.x) / 2, y: (part.start.y + part.end.y) / 2}
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

        setDraggingIndex(closestIndex)
      };


    // last minute rendering stuff
    const ToonMaterial = shaderMaterial(
        toonShader.uniforms,
        toonShader.vertexShader,
        toonShader.fragmentShader
    )
    extend({ ToonMaterial })

    const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
    // console.log(parts)
    // updatePoints(points)

    return (
        <>
        {parts.map((part, index) => {
            const point = points[index]
            console.log({ point })
            
            const midX = point?.x ? point.x : (part.start.x + part.end.x) / 2 - offset.x
            const midY = point?.y ? point.y : (part.start.y + part.end.y) / 2 - offset.y
            const z = point?.z ? point.z : 0
            // const midX = (part.start.x + part.end.x) / 2 - offset.x
            // const midY = (part.start.y + part.end.y) / 2 - offset.y
            
            // const midX = point ? point?.x : 0
            // const midY = point ? point?.y : 0

            // console.log({ point, lol: {midX, midY}})
            
            // const position = [ midX, midY, 0]

            const position = [ midX, midY, z]
            // console.log({ midX, midY})
            // console.log(part.angle)
            const rotation = [0,0, part.angle]
            // const rotation = [0,0, 1]


            // const rotation = [0,0, part.angle - Math.PI /2]
            return (
                <group>
                    <RigidBody key={index} ref={bodyRefs.current[index]} linearDamping={4}
                               position={position} type="dynamic" colliders="cuboid" name={`chain_${index}`}>
                        <mesh key={index} rotation={rotation} >
                            <boxGeometry args={[part.length,0.1,10]} />
                            {/* <sphereGeometry args={[part.length,1,1]} /> */}
                            {/* <cylinderGeometry args={[2, 2, part.length, 9]} /> */}

                            <meshStandardMaterial 
                            transparent opacity={0}
                            />
                        </mesh>
                    </RigidBody>
                    {index < parts.length ?  
                        <RopeJointBetween
                            key={`joint-${index}`}
                            length={part.length}
                            bodyA={bodyRefs.current[index]}
                            bodyB={bodyRefs.current[index - 1]}
                        />
                        :
                        <></>
                    }
                </group>
            )
        })}
        {curve && points.length > 0 && (
            <>
            <RigidBody colliders="cuboid">
                <mesh ref={tubeRef} onPointerDown={(e) => dragClosestRigidBody(e)}>
                    <primitive object={new THREE.TubeGeometry(curve, 200, 4.1, 5, false)} />
                    {/* <meshStandardMaterial  /> */}
                    <toonMaterial
                        uColor={new THREE.Color('white')}
                        uLight={new THREE.Vector3(5, 5, 5)}
                        />

                </mesh>
            </RigidBody>
            </>
        )}
                
        </>
    )
}

export default ChainCylinders