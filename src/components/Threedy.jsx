import { useEffect, useState, useRef, forwardRef } from 'react'
import { extractPathData, smartPropToPart } from '../helpers/index'
import { svgPathProperties } from 'svg-path-properties'

import { Canvas } from '@react-three/fiber'
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';

import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { invalidate } from '@react-three/fiber'

import { Physics } from '@react-three/rapier'
import ChainCylinders from './ChainCylinders'

import * as THREE from 'three'


const Threedy = ({ svgData, updatePoints, setIsDragging, updateTimestamp, resetVersion }) => {
    const [parts, setParts] = useState([])
    
    const [orbitControlsEnabled, setOrbitControlsEnabled] = useState(true)
    
    const [boxPos, setBoxPos] = useState({ x: 0, y: 0, z: 0 })

    
    const camRef = useRef(null)
    const gridRef = useRef(null)
    const controlsRef = useRef(null)

    const Controls = forwardRef((props, ref) => {
        return <OrbitControls ref={ref} autoRotateSpeed={0.2} autoRotate makeDefault {...props} />
      })

    useEffect(() => {
        const cam = camRef.current;
        if(gridRef.current && cam) {
            gridRef.current.position.y = 0
            cam.position.set(120, 5, -40);
        }
    }, [gridRef.current, camRef.current])

    useEffect(() => {
        if(controlsRef?.current) controlsRef.current.enabled = false
        const pathData = extractPathData(svgData)
        const properties = new svgPathProperties(pathData)
        
        const _parts = smartPropToPart({ properties })
        setParts(_parts)

        focusPath()
        if(controlsRef?.current) controlsRef.current.enabled = true
    }, [svgData])

    useEffect(() => {
        const timeout = setTimeout(() => {
          const cam = camRef.current;
          const grid = gridRef.current;
          if (grid && cam) {
            grid.position.set(0, 0, 0);
            cam.position.set(100, 25, -40);
            cam.updateProjectionMatrix();
            invalidate();
          }
        }, 50);
      
        return () => clearTimeout(timeout);
      }, [resetVersion]);

    const focusPath = (maxVals) => {
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
                                    updateTimestamp={updateTimestamp}
                                    setIsDragging={setIsDragging} />
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
