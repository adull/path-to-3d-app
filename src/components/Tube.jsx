import * as THREE from 'three'
import { useRef, useEffect } from 'react'
import { extend, useFrame } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import { toonShader } from '../helpers/shaders'

export default function Tube({ onDrag, bodyRefs }) {
  const meshRef = useRef()

  const ToonMaterial = shaderMaterial(
    toonShader.uniforms,
    toonShader.vertexShader,
    toonShader.fragmentShader
  )
  // console.log({ToonMaterial})
  extend({ ToonMaterial })

  useFrame(() => {
    const currentPoints = getCurrentPoints(bodyRefs)
    console.log({ currentPoints})
    if(currentPoints.length > 0) {
        const curve = new THREE.CatmullRomCurve3(currentPoints)
        const tubeGeom = new THREE.TubeGeometry(curve, 200, 4.1, 5, false)

        if (meshRef.current) {
            meshRef.current.geometry = tubeGeom
        }
    } 
    
  })

  // console.log({shouldRender: bodyRefs.length > 0, })


  if(bodyRefs.length > 0) {
    return (
        <mesh ref={meshRef} onPointerDown={(e) => onDrag(e)}>
          <bufferGeometry attach="geometry" />
          <toonMaterial
            uColor={new THREE.Color('black')}
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
    if(bodyRefs?.length > 0) {
        return bodyRefs.map(ref => {
            const pos = ref.current?.translation?.()
            return pos ? new THREE.Vector3(pos.x, pos.y, pos.z) : new THREE.Vector3()
          })
    } 
    return []
}
