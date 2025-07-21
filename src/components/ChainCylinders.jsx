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
    // const [draggingIndex, setDraggingIndex] = useState(-1)
    const [offset, setOffset] = useState({x: 0, y: 0})

    const pointsRef = useRef(null)
    const bodyRefs = useRef([])
    const curveRef = useRef(new THREE.CatmullRomCurve3([]))
    const meshRef = useRef()
    // const curveRef = useRef(null)
    const draggingIndexRef = useRef(-1)
    
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
        console.log(`does this update lol`)

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
        const handlePointerUp = () => { 
            console.log(`its this huh?`)
            // console.log({draggingIndex})
            if(draggingIndexRef.current > 0) {
                setOrbitControls(true); 
                draggingIndexRef.current = -1;
            }
        }
        window.addEventListener('pointerup', handlePointerUp)
        return () => window.removeEventListener('pointerup', handlePointerUp)
    }, [])


    // this costs a billion dollars
    useFrame(({ camera, mouse: mousePos}) => {

        const _pts = bodyRefs.current.map(ref => {
            const pos = ref.current?.translation()
            return pos ? new THREE.Vector3(pos.x, pos.y, pos.z) : new THREE.Vector3()
        })
        
        const newPts = _pts.map(pt => new THREE.Vector3(pt.x, pt.y, pt.z))
        const omg = new THREE.CatmullRomCurve3(newPts);
        if(meshRef.current) {
            console.log(`meshref curerent is here`)
            meshRef.current.geometry = new THREE.TubeGeometry(omg, 200, 4.1, 5, false)
        } 


        const body = bodyRefs.current[draggingIndexRef.current]

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
      
        const virtualPoint = e.point;
        console.log({ virtualPoint })
        let closestIndex = -1;
        let minDistance = Infinity;
      
        points.forEach((point, index) => {
          const dx = point.x - virtualPoint.x;
          const dy = point.y - virtualPoint.y;
          const dz = point.z - virtualPoint.z;
      
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = index;
          }
        });

        draggingIndexRef.current = closestIndex
      };


    // last minute rendering stuff
    const ToonMaterial = shaderMaterial(
        toonShader.uniforms,
        toonShader.vertexShader,
        toonShader.fragmentShader
    )
    extend({ ToonMaterial })
    // console.log(bodyRefs.current)
    // const curve = new THREE.CatmullRomCurve3(pointsRef.current ? pointsRef.current : [])
    // console.log({ curve })
    // updatePoints(points)

    return (
        <>
        {console.log(curveRef)}
        {parts.map((part, index) => {
            const point = points[index]
            // console.log({ point })
            
            const midX = point?.x ? point.x : (part.start.x + part.end.x) / 2 - offset.x
            const midY = point?.y ? point.y : (part.start.y + part.end.y) / 2 - offset.y
            // const z = point?.z ? point.z : 0
            const z = 0

            const position = [ midX, midY, z]
            const rotation = [0,0, part.angle]

            return (
                <group>
                    <RigidBody key={index} ref={bodyRefs.current[index]} linearDamping={5}
                               position={position} type="dynamic" colliders="cuboid" name={`chain_${index}`}>
                        <mesh key={index} rotation={rotation} >
                            <boxGeometry args={[part.length,0.1,10]} />
                            {/* <sphereGeometry args={[part.length,1,1]} /> */}
                            {/* <cylinderGeometry args={[2, 2, part.length, 9]} /> */}

                            <meshStandardMaterial color={'black'}
                            // transparent opacity={0}
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
        {console.log(meshRef)}
        {meshRef.current && (
            <group>
                <mesh ref={meshRef} onPointerDown={(e) => dragClosestRigidBody(e)}>
                    <primitive object={new THREE.TubeGeometry(curveRef.current, 200, 4.1, 5, false)} />
                    {/* <bufferGeometry ref={curveRef} /> */}
                    <toonMaterial
                        uColor={new THREE.Color('white')}
                        uLight={new THREE.Vector3(5, 5, 5)}
                        />

                </mesh>
            </group>
        )}
                
        </>
    )
}

export default ChainCylinders