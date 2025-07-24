import React, { forwardRef, useImperativeHandle, useEffect } from 'react'
import { RigidBody } from "@react-three/rapier"

const ChainLink = forwardRef(({ index, damping, position, part, rotation }, ref) => {
// const ChainLink = ({ index, damping, position, part, rotation, ref}) => {
    // console.log({ r: ref.current })
    // useImperativeHandle(ref, () => ({
    //     getRigidBody: () => ref.current,
    //     getPosition: () => ref.current?.translation(),
    //   }))
    
    // console.log({ index, damping, position, part, rotation, ref })

    useEffect(() => {
        if (ref.current) {
          const pos = ref.current.translation()
          console.log('safe position', pos)
        }
      }, [ref.current])

    if(position && part) {
        return (
            <RigidBody key={`rigidBody_${index}`} ref={ref} linearDamping={damping}
                       position={position} type="dynamic" colliders="cuboid">
                <mesh key={`mesh_${index}`} rotation={rotation} >
                    <boxGeometry args={[part.length,0.1,10]} />
                    <meshStandardMaterial 
                    // transparent opacity={0}
                    />
                </mesh>
            </RigidBody>
        )
    } 
    return <></>
    
})

export default ChainLink;