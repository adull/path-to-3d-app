import { useRef } from 'react'
import { OrbitControls } from '@react-three/drei'

const Controls = () => {
    const controlsRef = useRef(null)
    console.log(`in controls tho`)
    console.log({ controlsRef })

    return <OrbitControls ref={controlsRef} onChange={() => {
        // console.log(camera.raycaster.camera.position)        
    }} />
}

export default Controls