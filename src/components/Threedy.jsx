import { useEffect, useState, useRef, forwardRef } from 'react'
import { extractPathData, propertiesToParts } from '../helpers/index'
import { svgPathProperties } from 'svg-path-properties'

import { Canvas } from '@react-three/fiber'
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';

import Controls from './Controls'

import { OrbitControls, PerspectiveCamera } from '@react-three/drei'

import { Physics } from '@react-three/rapier'
import ChainCylinders from './ChainCylinders'

import * as THREE from 'three'


const Threedy = ({ svgData }) => {
    const [parts, setParts] = useState([])
    const [camPos, setCamPos] = useState({ x: 0, y: 0, z: 700 })
    const [orbitControlsEnabled, setOrbitControlsEnabled] = useState(true)
    const [exportRef, setExportRef] = useState(null)
    const [boxPos, setBoxPos] = useState({ x: 0, y: 0, z: 0 })

    const [boxDim, setBoxDim] = useState({ x: 15, y: 15, z: 1 })
    const camRef = useRef(null)
    const meshRef = useRef(null)
    const controlsRef = useRef(null)

    const Controls = forwardRef((props, ref) => {
        return <OrbitControls ref={ref} makeDefault {...props} />
      })



    useEffect(() => {
        const pathData = extractPathData(svgData)
        const properties = new svgPathProperties(pathData)
        
        // propertiesToParts returns an array. 
        // Changing the value of interval increases the resolution but can result in choppiness in framerate for 3js
        const _parts = propertiesToParts({ properties, interval: 150})
        setParts(_parts)

        focusPath()
    }, [svgData])

    const download = () => {
        const exporter = new OBJExporter()
        const objText = exporter.parse(exportRef?.current)

        const blob = new Blob([objText], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.style.visibility = 'none'
        link.href = url
        link.download = 'model.obj'
        link.click()
    }

    // const moveCamera = ({ minX, maxX, minY, maxY}) => {
    //     console.log({ minX, maxX, minY, maxY })
    // }

    const focusPath = (maxVals) => {
        console.log(`focuyspath cslled...`)
        console.log({ maxVals })
        if(maxVals) {
            const offset = 1.25
            // const boundingBox = new THREE.Box3().
    
            // const center = boundingBox.getCenter()
            // const size = boundingBox.getSize()
    
            const cam = camRef?.current
            if(cam) {
                
                const xDiff  = maxVals.maxX - maxVals.minX
                const yDiff = maxVals.maxY - maxVals.minY
                // setBoxDim({x: xDiff, y: yDiff, z: 1})
                setBoxDim({x: 1, y: 1, z: 1})

                // setBoxPos({ x: maxVals.minX + xDiff / 2, y: maxVals.minY + yDiff / 2, z: boxPos.z})

                const targetPos = { x: (maxVals.minX + maxVals.maxX) / 2, y: (maxVals.minY + maxVals.maxY) / 2, z: boxPos.z}
                setBoxPos(targetPos)
                
                const maxDim = Math.max(xDiff, yDiff)
                const fov = cam.fov * (Math.PI / 180)
                const cameraZ = (Math.abs( maxDim / 4 * Math.tan(fov * 2))) * offset
                
                // const xPos = (maxVals.minX + maxVals.maxX) / 2
                // const yPos = (maxVals.minY + maxVals.maxY) / 2

                console.log({ x: targetPos.x, y: targetPos.y })
                // console.log({ controlsRef })
                // controlsRef.current.target.set(targetPos.x, targetPos.y, 0)
                // controlsRef.current.position0.set(targetPos.x, targetPos.y, cameraZ)


                // controlsRef.current.update()


                // setCamPos({ x: targetPos.x, y: targetPos.y, z: cameraZ })
                cam.position.set(targetPos.x, targetPos.y, cameraZ);
                cam.updateProjectionMatrix();


                if (orbitControlsEnabled && controlsRef?.current) {
                    controlsRef.current.target.set(targetPos.x, targetPos.y, 0);
                    cam.position.set(targetPos.x, targetPos.y, cameraZ);
                    controlsRef.current.update();
                }
            }
        }
        
    }

    const getCamPos = () => {
        const cam = camRef.current

        const position = cam?.position
        console.log({ position })
    }

    return (
        <>
            <Canvas style={{height: window.innerHeight, width: window.innerWidth}}>
                <PerspectiveCamera makeDefault ref={camRef}/>
                <ambientLight intensity={0.4} />
                <directionalLight color="red" position={[0, 0, 5]} />
                <directionalLight color="red" position={[0, 5, 0]} />
                <Physics gravity={[0,0,0]} >
                    <ChainCylinders parts={parts} focusPath={focusPath} />
                </Physics>
                <mesh ref={meshRef} position={[boxPos.x,boxPos.y,boxPos.z]}>
                    <boxGeometry args={[boxDim.x, boxDim.y, boxDim.z]} />
                    <meshStandardMaterial color="orange" />
                </mesh>
                
                {orbitControlsEnabled ? <Controls ref={controlsRef} /> : <></>}
            </Canvas>
            <div style={{position: `absolute`, top: 0, right: 0}}>
            <label htmlFor={`controls`}>Controls:</label> 
            <input id="controls" type={`checkbox`} checked={orbitControlsEnabled} onChange={() => setOrbitControlsEnabled(!orbitControlsEnabled)}/>
            <button style={{backgroundColor: 'white', color: 'black'}} onClick={download}>Download</button>
            </div>
            <button onClick={getCamPos} style={{position: `absolute`, top: 0, left: 0}}>getCamPos</button>
        </>
    );
    }

export default Threedy;
