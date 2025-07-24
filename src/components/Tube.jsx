import * as THREE from 'three'
import { useState, useRef, useEffect } from 'react'
import { extend, useFrame } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import { toonShader } from '../helpers/shaders'

export default function Tube({ onDrag, bodyRefs }) {
  const [isMobile, setIsMobile] = useState(false)

  const meshRef = useRef()
  const fatMeshRef = useRef()

  const ToonMaterial = shaderMaterial(
    toonShader.uniforms,
    toonShader.vertexShader,
    toonShader.fragmentShader
  )
  extend({ ToonMaterial })

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768)
    checkScreen()
    window.addEventListener('resize', checkScreen)
    return () => window.removeEventListener('resize', checkScreen)
  }, [])

  useFrame(() => {
    const currentPoints = getCurrentPoints(bodyRefs)
    if(currentPoints.length > 0) {
        const curve = new THREE.CatmullRomCurve3(currentPoints)
        const tubeGeom = new THREE.TubeGeometry(curve, 200, 4.1, 5, false)
        const fatTube = new THREE.TubeGeometry(curve, 200, 24.1, 5, false)

        if (meshRef.current) {
            meshRef.current.geometry = tubeGeom
        }
        if (fatMeshRef.current && isMobile) {
          fatMeshRef.current.geometry = fatTube
        }
    } 
  })



  if(bodyRefs.length > 0) {
    return (
      <group>
        {isMobile && (
        <mesh ref={fatMeshRef} onPointerDown={onDrag}>
          <bufferGeometry attach="geometry" />
          <meshStandardMaterial 
          transparent opacity={0} 
          />
        </mesh>
      )}
        <mesh ref={meshRef} onPointerDown={!isMobile ? onDrag : () => {}}>
          <bufferGeometry attach="geometry" />
          <toonMaterial
            uColor={new THREE.Color('white')}
            uLight={new THREE.Vector3(5, 5, 5)}
            />
        </mesh>
      </group>
      
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
