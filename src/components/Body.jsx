import { useState, useEffect, useRef } from 'react'
import Draw from './Draw'
import Threedy from './Threedy'
import ThreedyPointsContext from '../context/ThreedyPointsContext'
import Controls from './Controls'

const Body = () => {
    const [svgData, setSvgData] = useState(null)
    const [height, setHeight] = useState(300)
    const [isDrawing, setIsDrawing] = useState(false)
    const [resetVersion, setResetVersion] = useState(0)

    const dampingRef = useRef(4)
    const threedyPointsRef = useRef([])
    const isDraggingRef = useRef(false)
    const timestampRef = useRef(null)

    const gameRef = useRef(null)

    const reset = (e) => {
        e.preventDefault()
        setSvgData(null)
        threedyPointsRef.current = []
        isDraggingRef.current = -1
        dampingRef.current = 4
        timestampRef.current = performance.now()
        setResetVersion(v => v + 1)
    }

    const updatePoints = (pts) => {
        threedyPointsRef.current = pts
    }

    const updateDragging = (isDragging) => {
        isDraggingRef.current = isDragging
    }

    const updateTimestamp = () => {
        timestampRef.current = performance.now()
    }

    useEffect(() => {
        const bullshitHeight = 100
        setHeight(window.innerHeight - bullshitHeight)
    }, [])

    const updateDamping = (val) => { 
        dampingRef.current = val
    }
    
    return (
        <ThreedyPointsContext.Provider value={{threedyPointsRef, isDraggingRef, dampingRef, timestampRef}}>
                <div className="container mx-auto pb-6 flex flex-col" ref={gameRef} style={{height}}>
                    <div className="flex flex-col md:flex-row flex-1">
                        <div className="border b-1 border-x-0 md:border-x-1 border-black h-[50%] md:h-[100%] w-full md:w-1/2">
                            <Draw setSvgData={setSvgData} resetVersion={resetVersion} />
                        </div>
                        <div className="border b-1 border-x-0 md:border-r-1 border-t-0 md:border-t-1 border-black h-[50%] md:h-[100%] w-full md:w-1/2">
                            <Threedy svgData={svgData} updatePoints={updatePoints} updateTimestamp={updateTimestamp} setIsDragging={updateDragging} isDrawing={isDrawing} resetVersion={resetVersion}/>
                        </div>
                    </div>
                    <Controls reset={reset} setDamping={updateDamping} />
                </div>
        </ThreedyPointsContext.Provider>
    );
}

export default Body;
