import { useEffect, useState, useRef, forwardRef } from 'react'
import { extractPathData, propertiesToParts, smartPropToPart, dumbPropToPart } from '../helpers/index'
import { svgPathProperties } from 'svg-path-properties'

import { Canvas } from '@react-three/fiber'
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';

import { OrbitControls, PerspectiveCamera } from '@react-three/drei'

import { Physics } from '@react-three/rapier'
import ChainCylinders from './ChainCylinders'

import * as THREE from 'three'


const Threedy = ({ svgData, updatePoints, setIsDragging, isDrawing }) => {
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

    useEffect(() => {
        // console.log(`mount`)
        // console.log(gridRef.current)
    }, [])

    useEffect(() => {
        const cam = camRef.current;
        if(gridRef.current && cam) {
            gridRef.current.position.y = 0
            cam.position.set(100, 25, -40);
        }
    }, [gridRef.current, camRef.current])

    useEffect(() => {
        // setOrbitControlsEnabled(false)
        if(controlsRef?.current) controlsRef.current.enabled = false
        // console.log(`when does svgdata useeffect fire?`)
        const pathData = extractPathData(svgData)
        const properties = new svgPathProperties(pathData)
        
        // propertiesToParts returns an array. 
        // Changing the value of interval increases the resolution but can result in choppiness in framerate for 3js
        // const _parts = propertiesToParts({ properties, interval: 1})
        // const _parts = dumbPropToPart({ properties })
        const _parts = smartPropToPart({ properties })
        console.log({_parts})
        setParts(_parts)

        focusPath()
        if(controlsRef?.current) controlsRef.current.enabled = true
        // setOrbitControlsEnabled(true)
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
        // console.log({ maxVals })
        if(maxVals) {
            const offset = 1.25

            const cam = camRef?.current
            if(cam) {
                
                const xDiff  = maxVals.maxX - maxVals.minX
                const yDiff = maxVals.maxY - maxVals.minY

                const targetPos = { x: (maxVals.minX + maxVals.maxX) / 2, y: (maxVals.minY + maxVals.maxY) / 2, z: boxPos.z}
                setBoxPos(targetPos)
                
                const maxDim = Math.max(xDiff, yDiff)
                const fov = cam.fov * (-Math.PI / -180)
                const cameraZ = (Math.abs( maxDim / 4 * Math.tan(fov * 2))) * offset
                

                cam.position.set(targetPos.x, 25, cameraZ);
                cam.updateProjectionMatrix();

                // update grid
                // console.log(gridRef.current)
                // console.log(maxVals.minY - (maxVals.maxY + maxVals.minY) / 2 - 20)
                gridRef.current.position.y = maxVals.minY - (maxVals.maxY + maxVals.minY) / 2 - 20
            }
        }
        setOrbitControlsEnabled(true)
        
    }

    return (
        <div className="w-full h-full">
            <Canvas className="h-full">
                <PerspectiveCamera makeDefault ref={camRef}/>
                {/* <ambientLight intensity={0.4} /> */}
                <directionalLight color="white" position={[0, 0, 5]} />
                <directionalLight color="white" position={[0, 5, 0]} />
                <Physics gravity={[0,0,0]} >
                    <ChainCylinders parts={parts}  
                                    setOrbitControls={(bool) => setOrbitControlsEnabled(bool)} 
                                    focusPath={focusPath} 
                                    updatePoints={updatePoints}
                                    setIsDragging={setIsDragging}
                                    isDrawing={isDrawing} />
                </Physics>
                {orbitControlsEnabled ? <Controls makeDefault ref={controlsRef} /> : <></>}
                <gridHelper
                    ref={gridRef}
                    args={[10000, 100, '#000000', '#cccccc']}
                    position={[0, 0, 0]}
                    rotation={[0, -Math.PI / 2, 0]}
                    />
            </Canvas>
        </div>
    );
    }

export default Threedy;
