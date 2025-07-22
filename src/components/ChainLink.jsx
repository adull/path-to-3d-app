import React, { forwardRef } from 'react'
import { RigidBody } from "@react-three/rapier"

const ChainLink = forwardRef(({ index, damping, position, part, rotation }, ref) => (
        <RigidBody key={`rigidBody_${index}`} ref={ref} linearDamping={damping}
                   position={position} type="dynamic" colliders="cuboid" name={`chain_${index}`}>
            <mesh key={`mesh_${index}`} rotation={rotation} >
                <boxGeometry args={[part.length,0.1,10]} />
                <meshStandardMaterial transparent opacity={0}/>
            </mesh>
        </RigidBody>
))

export default ChainLink;