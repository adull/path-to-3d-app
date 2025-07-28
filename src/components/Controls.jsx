import { useRef } from 'react'
import { OrbitControls } from '@react-three/drei'

const Controls = () => {
    const controlsRef = useRef(null)

    return <OrbitControls ref={controlsRef} onChange={() => {
        // console.log(camera.raycaster.camera.position)        
    }} />
}

export default Controls