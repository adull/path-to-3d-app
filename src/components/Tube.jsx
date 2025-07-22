import * as THREE from 'three'
import { useRef, useEffect } from 'react'
import { extend, useFrame } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import { toonShader } from '../helpers/shaders'

export default function Tube({ onDrag, bodyRefs }) {
    console.log({ bodyRefs })
  const meshRef = useRef()

  const ToonMaterial = shaderMaterial(
    toonShader.uniforms,
    toonShader.vertexShader,
    toonShader.fragmentShader
  )
  extend({ ToonMaterial })

  useFrame(() => {
    // const currentPoints = getCurrentPoints(bodyRefs)
    // if(currentPoints.length > 0) {
    //     const curve = new THREE.CatmullRomCurve3(currentPoints)
    //     const tubeGeom = new THREE.TubeGeometry(curve, 200, 4.1, 5, false)
    //     // console.log(tubeGeom)

    //     if (meshRef.current) {
    //         // console.log(`it is current`)
    //         meshRef.current.geometry = tubeGeom
    //     }
    // } 
  })



  if(bodyRefs.length > 0) {
    return (
        <mesh ref={meshRef} onPointerDown={(e) => onDrag(e)}>
          <bufferGeometry attach="geometry" />
          <toonMaterial
            uColor={new THREE.Color('white')}
            uLight={new THREE.Vector3(5, 5, 5)}
            />
        </mesh>
      )
  } else {
    return <></>
  }
}

// Helper to get Vector3s from refs
function getCurrentPoints(bodyRefs) {
    if(bodyRefs.length > 0) {
        return bodyRefs.map(ref => {
            const pos = ref.current?.translation?.()
            return pos ? new THREE.Vector3(pos.x, pos.y, pos.z) : new THREE.Vector3()
          })
    } 
    return []
}
