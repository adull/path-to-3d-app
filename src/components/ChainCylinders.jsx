import React, { useRef, useState, useMemo, useEffect } from 'react'
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
        

        setPoints(bodyRefs.current.map(ref => {
            const pos = ref.current?.translation()
            return pos ? new THREE.Vector3(pos.x, pos.y, pos.z) : new THREE.Vector3()
        }))

        let [minX, minY, minZ] = [0,0,0]
        let [maxX,maxY,maxZ] = [0,0,0]
        if(bodyRefs.current.length > 0) { 
            const first = bodyRefs.current[0];
            [minX, minY, minZ] = [first.x, first.y, first.z]
        }   
        
        bodyRefs.current.forEach(item => {
            console.log({ item }) 
            const it = item.current.translation();
            if(it.x < minX) minX = it.x
            if(it.y < minY) minY = it.y
            if(it.z < minZ) minZ = it.z
            if(it.x > maxX) maxX = it.x
            if(it.y > maxY) maxY = it.y
            if(it.z > maxZ) maxZ = it.z
        })

        console.log({ minX, maxX})
        console.log({ minY, maxY})
        console.log({ minZ, maxZ})

        
    }

    useFrame(() => {
        setPoints(bodyRefs.current.map(ref => {
            ref.current?.lockTranslations()
            ref.current?.lockRotations()

            const pos = ref.current?.translation()
            return pos ? new THREE.Vector3(pos.x, pos.y, pos.z) : new THREE.Vector3()
        }))
    })

    const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
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
                    <RigidBody key={index} ref={bodyRefs.current[index]} linearDamping={0} angularDamping={0}
                               position={position} type="dynamic" colliders="cuboid" name={`chain_${index}`}>
                        <mesh key={index} rotation={rotation}>
                            <boxGeometry args={[part.length,1,1]} />
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
                            bodyB={bodyRefs.current[index + 1]}
                        />
                        :
                        <></>
                    }
                </>
            )
        })}
        {curve && points.length > 0 && (
            <>
            <RigidBody colliders="cuboid">
                <mesh ref={tubeRef}>
                    <primitive object={new THREE.TubeGeometry(curve, 100, 1.1, 5, false)} />
                    <meshStandardMaterial color="orange" />
                </mesh>
            </RigidBody>
            </>
        )}
                
        </>
    )
}

export default ChainCylinders