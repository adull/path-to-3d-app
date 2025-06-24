import React, { useRef, useState, useMemo } from 'react'
import { useFrame } from "@react-three/fiber"
import { RigidBody, InstancedRigidBodies } from "@react-three/rapier"
import RopeJointBetween from "./RopeJointBetween"
import * as THREE from 'three'

const ChainCylinders = ({ parts, setExportRef }) => {
    const[points,setPoints] = useState([])

    const tubeRef = useRef(null)
    const bodyRefs = useRef([])

    if(bodyRefs.current.length !== parts.length) {
        bodyRefs.current = Array(parts.length).fill().map((_, i) => bodyRefs.current[i] || React.createRef(null))
    }

    useFrame(() => {
        setPoints(bodyRefs.current.map(ref => {
            const pos = ref.current?.translation()
            return pos ? new THREE.Vector3(pos.x, pos.y, pos.z) : new THREE.Vector3()
        }))
    })

    const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);

    console.log({ curve })
    setExportRef(tubeRef)

    return (
        <>
        {parts.map((part, index) => {
            const midX = (part.start.x + part.end.x) / 2
            const midY = (part.start.y + part.end.y) / 2

            const position = [ midX, midY, 0]

            const rotation = [0,0, part.angle]
            return (
                <>
                        <mesh key={index} rotation={rotation} position={position}>
                            <boxGeometry args={[part.length,100,1]} />
                            <meshStandardMaterial 
                            transparent opacity={0} 
                            />
                        </mesh>
                </>
            )
        })}
        {curve && points.length > 0 && (
                <mesh ref={tubeRef}>
                    <primitive object={new THREE.TubeGeometry(curve, 100, 1.1, 5, false)} />
                    <meshStandardMaterial color="orange" />
                </mesh>
        )}
                
        </>
    )
}

export default ChainCylinders