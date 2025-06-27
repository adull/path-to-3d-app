import React, { useRef, useState, useMemo, useEffect } from 'react'
import { getMaxVals } from '../helpers/index'
import { useFrame } from "@react-three/fiber"
import { RigidBody, InstancedRigidBodies } from "@react-three/rapier"
import RopeJointBetween from "./RopeJointBetween"
import * as THREE from 'three'

const ChainCylinders = ({ parts, cb }) => {
    const[points,setPoints] = useState([])

    const tubeRef = useRef(null)
    const bodyRefs = useRef([])

    // useEffect(() => {
    //     setPoints(bodyRefs.current.map(ref => {
    //         bodyRefs.current = Array(parts.length).fill().map((_, i) => bodyRefs.current[i] || React.createRef(null))
    //             const pos = ref.current?.translation()
    //             return pos ? new THREE.Vector3(pos.x, pos.y, pos.z) : new THREE.Vector3()
    //     }))
    // }, [parts])

    if(bodyRefs.current.length !== parts.length) {
        bodyRefs.current = Array(parts.length).fill().map((_, i) => bodyRefs.current[i] || React.createRef(null))
        

        setPoints(bodyRefs.current.map(ref => {
            const pos = ref.current?.translation()
            return pos ? new THREE.Vector3(pos.x, pos.y, pos.z) : new THREE.Vector3()
        }))
    }

        
        // bodyRefs.current.forEach(async(item) =>  {
        //     console.log(item) 
            // item.current?.sleep()
            // const {x, y,z} = await item.current?.translation();
            // let [x, y, z] = [0,0,0]
            // console.log(item.current)
            // if(item.current?.translation()) {
            //     let it = item.current.translation()
            //     x = it.x
            //     y = it.y
            //     z = it.z
            // }
            // console.log({ x, y, z})
            // item.current.setLinvel({ x: 0, y: 0, z: 0 }, true); // linear velocity
            // item.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
            
            // if(x < minX) minX = x
            // if(y < minY) minY = y
            // if(z < minZ) minZ = z
            // if(x > maxX) maxX = x
            // if(y > maxY) maxY = y
            // if(z > maxZ) maxZ = z
        // })

        // console.log({ minX, maxX})
        // console.log({ minY, maxY})
        // console.log({ minZ, maxZ})

        
    // }

    useFrame(() => {
        setPoints(bodyRefs.current.map(ref => {
            // ref.current?.lockTranslations()
            // ref.current?.lockRotations()

            const pos = ref.current?.translation()
            return pos ? new THREE.Vector3(pos.x, pos.y, pos.z) : new THREE.Vector3()
        }))
    })

    const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
    console.log({ curve })
    // const { minX, maxX, minY, maxY } = getMaxVals(curve)
    // maxvals is of shape { minX, maxX, minY, maxY}
    const maxVals = getMaxVals(curve)
    // moveCamera(getMaxVals(curve))
    // setExportRef(tubeRef)
    cb(maxVals, tubeRef)

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