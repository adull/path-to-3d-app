import { useEffect, useState } from 'react'
import { extractPathData, propertiesToParts } from '../helpers/index'
import { svgPathProperties } from 'svg-path-properties'

import { Canvas } from '@react-three/fiber'
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';

import Controls from './Controls'

import { OrbitControls, PerspectiveCamera } from '@react-three/drei'

import { Physics } from '@react-three/rapier'
import ChainCylinders from './ChainCylinders'



const Threedy = ({ svgData }) => {
    const [parts, setParts] = useState([])
    const [orbitControlsEnabled, setOrbitControlsEnabled] = useState(true)
    const [exportRef, setExportRef] = useState(null)


    useEffect(() => {
        const pathData = extractPathData(svgData)
        const properties = new svgPathProperties(pathData)
        
        // propertiesToParts returns an array. 
        // Changing the value of interval increases the resolution but can result in choppiness in framerate for 3js
        const _parts = propertiesToParts({ properties, interval: 150})
        console.log({ _parts })
        setParts(_parts)


        // console.log({ pathData })
    }, [svgData])

    const download = () => {
        const exporter = new OBJExporter()
        console.log(exportRef)
        const objText = exporter.parse(exportRef?.current)

        console.log({ objText })
        const blob = new Blob([objText], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.style.visibility = 'none'
        link.href = url
        link.download = 'model.obj'
        link.click()
    }
    
    return (
        <>
            <Canvas style={{height: window.innerHeight, width: window.innerWidth}}>
                <PerspectiveCamera makeDefault position={[0, 0, 700]} />
                <ambientLight intensity={0.4} />
                <directionalLight color="red" position={[0, 0, 5]} />
                <directionalLight color="red" position={[0, 5, 0]} />
                <ChainCylinders parts={parts} setExportRef={setExportRef}/>
                
                {orbitControlsEnabled ? <Controls /> : <></>}
            </Canvas>
            <div style={{position: `absolute`, top: 0, right: 0}}>
            <label htmlFor={`controls`}>Controls:</label> 
            <input id="controls" type={`checkbox`} checked={orbitControlsEnabled} onChange={() => setOrbitControlsEnabled(!orbitControlsEnabled)}/>
            <button style={{backgroundColor: 'white', color: 'black'}} onClick={download}>Download</button>
            </div>
        </>
    );
    }

export default Threedy;
