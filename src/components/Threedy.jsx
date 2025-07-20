import { useEffect, useState, useRef, forwardRef } from 'react'
import { extractPathData, propertiesToParts, dumbPropToPart } from '../helpers/index'
import { svgPathProperties } from 'svg-path-properties'

import { Canvas } from '@react-three/fiber'
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';

import { useFrame } from "@react-three/fiber"

import { OrbitControls, PerspectiveCamera } from '@react-three/drei'

import { Physics } from '@react-three/rapier'
import ChainCylinders from './ChainCylinders'

import * as THREE from 'three'


const Threedy = ({ svgData, updatePoints }) => {
    const [parts, setParts] = useState([])
    
    const [orbitControlsEnabled, setOrbitControlsEnabled] = useState(true)
    const [exportRef, setExportRef] = useState(null)
    const [boxPos, setBoxPos] = useState({ x: 0, y: 0, z: 0 })

    
    const camRef = useRef(null)
    const gridRef = useRef(null)
    const controlsRef = useRef(null)

    const Controls = forwardRef((props, ref) => {
        return <OrbitControls ref={ref} autoRotateSpeed={0.2} autoRotate makeDefault {...props} />
      })


    // useFrame(() => {
        
    // })

    useEffect(() => {
        // setOrbitControlsEnabled(false)
        if(controlsRef?.current) controlsRef.current.enabled = false
        // console.log(`when does svgdata useeffect fire?`)
        const pathData = extractPathData(svgData)
        const properties = new svgPathProperties(pathData)
        
        // propertiesToParts returns an array. 
        // Changing the value of interval increases the resolution but can result in choppiness in framerate for 3js
        // const _parts = propertiesToParts({ properties, interval: 1})
        const _parts = dumbPropToPart({ properties })
        setParts(_parts)

        focusPath()
        if(controlsRef?.current) controlsRef.current.enabled = true
        // setOrbitControlsEnabled(true)


        console.log(camRef.current)
        // setTimeout(() => {
        //     setOrbitControlsEnabled(true)
        //     console.log(`ye`)
        // }, 1000)
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
        if(maxVals) {
            const offset = 1.25
            // const boundingBox = new THREE.Box3().
    
            // const center = boundingBox.getCenter()
            // const size = boundingBox.getSize()
    
            const cam = camRef?.current
            if(cam) {
                
                const xDiff  = maxVals.maxX - maxVals.minX
                const yDiff = maxVals.maxY - maxVals.minY

                const targetPos = { x: (maxVals.minX + maxVals.maxX) / 2, y: (maxVals.minY + maxVals.maxY) / 2, z: boxPos.z}
                setBoxPos(targetPos)
                
                const maxDim = Math.max(xDiff, yDiff)
                console.log({ maxDim })
                const fov = cam.fov * (-Math.PI / -180)
                const cameraZ = (Math.abs( maxDim / 4 * Math.tan(fov * 2))) * offset
                console.log({ cameraZ })
                

                cam.position.set(targetPos.x, 25, cameraZ);
                console.log(maxVals.maxY)
                cam.updateProjectionMatrix();

                // update grid
                console.log(gridRef.current)
                gridRef.current.position.y = maxVals.minY - (maxVals.maxY + maxVals.minY) / 2 - 20
            }
        }
        setOrbitControlsEnabled(true)
        
    }

    return (
        <div class="w-full h-full">
            <Canvas class="h-full">
                <PerspectiveCamera makeDefault ref={camRef}/>
                <ambientLight intensity={0.4} />
                <directionalLight color="red" position={[0, 0, 5]} />
                <directionalLight color="red" position={[0, 5, 0]} />
                <Physics gravity={[0,0,0]} >
                    <ChainCylinders parts={parts} setOrbitControls={(bool) => setOrbitControlsEnabled(bool)} focusPath={focusPath} updatePoints={updatePoints} />
                </Physics>
                {orbitControlsEnabled ? <Controls makeDefault ref={controlsRef} /> : <></>}
                <gridHelper
                    ref={gridRef}
                    args={[10000, 100, '#000000', '#cccccc']}
                    position={[0, 0, 0]}
                    rotation={[0, -Math.PI / 2, 0]}
                    />
            </Canvas>
            <div style={{position: `absolute`, top: 0, right: 0}}>
            <label htmlFor={`controls`}>Controls:</label> 
            <input id="controls" type={`checkbox`} checked={orbitControlsEnabled} onChange={() => setOrbitControlsEnabled(!orbitControlsEnabled)}/>
            <button style={{backgroundColor: 'white', color: 'black'}} onClick={download}>Download</button>
            </div>
        </div>
    );
    }

export default Threedy;
