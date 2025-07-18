import React, { useRef, useState, useMemo, useEffect } from 'react'
import { getMaxVals, alt } from '../helpers/index'
import { useFrame } from "@react-three/fiber"
import { RigidBody, InstancedRigidBodies } from "@react-three/rapier"
import RopeJointBetween from "./RopeJointBetween"
import * as THREE from 'three'

const ChainCylinders = ({ parts, focusPath }) => {
    const[points,setPoints] = useState([])

    const tubeRef = useRef(null)
    const bodyRefs = useRef([])

    if(bodyRefs.current.length !== parts.length) {
        bodyRefs.current = Array(parts.length).fill().map((_, i) => bodyRefs.current[i] || React.createRef(null))
        

        setPoints(bodyRefs.current.map(ref => {
            const pos = ref.current?.translation()
            return pos ? new THREE.Vector3(pos.x, pos.y, pos.z) : new THREE.Vector3()
        }))
    }

    useEffect(() => {
        console.log({ parts})

        // console.log({ parts })
        const _pts = bodyRefs.current.map(ref => {
            // ref.current?.lockTranslations()
            // ref.current?.lockRotations()

            const pos = ref.current?.translation()
            return pos ? new THREE.Vector3(pos.x, pos.y, pos.z) : new THREE.Vector3()
        })
        

        const maxVals = alt(_pts)
        console.log({maxVals})
        console.log({ _pts })
        const avgX = (maxVals?.maxX + maxVals?.minX) / 2
        const avgY = (maxVals?.maxY + maxVals?.minY) / 2

        const newPts = _pts.map(pt => new THREE.Vector3(pt.x - avgX, pt.y - avgY, pt.z))

        console.log({ newPts })

        setPoints(newPts)
        focusPath(maxVals)

        // const maxVals = getMaxVals()
        // cb(maxVals, tubeRef)
        
        // console.log({ points })

        

    }, [parts])

    const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
    console.log({ curve})

    // console.log(curve)
    // const maxVals = getMaxVals(curve)
    // cb(maxVals, tubeRef)
    // console.log(`rener?`)

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