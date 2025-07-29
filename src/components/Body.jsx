import { useState, useEffect, useRef, use } from 'react'
import Draw from './Draw'
import Threedy from './Threedy'
import ThreedyPointsContext from '../context/ThreedyPointsContext'
import DraggingContext from '../context/DraggingContext'
import DampingContext from '../context/DampingContext'
import Controls from './Controls'

const Body = () => {
    const [svgData, setSvgData] = useState(null)
    const [height, setHeight] = useState(300)
    const threedyPointsRef = useRef([])
    const isDraggingRef = useRef(false)
    const [isDrawing, setIsDrawing] = useState(false)
    // const [damping, setDamping] = useState(4)
    const dampingRef = useRef(4)

    const gameRef = useRef(null)

    const reset = () => {
        setSvgData(null)
        // setThreedyPoints([])
        threedyPointsRef.current = []
    }

    const updatePoints = (pts) => {
        threedyPointsRef.current = pts
    }

    const updateDragging = (isDragging) => {
        isDraggingRef.current = isDragging
    }

    useEffect(() => {
        // console.log(gameRef.current)
        console.log(window.innerHeight)
        const bullshitHeight = 100
        setHeight(window.innerHeight - bullshitHeight)
    }, [])

    const callSetDamping = (val) => { 
        console.log(val)
        dampingRef.current = val
    }
    
    return (
        <ThreedyPointsContext.Provider value={threedyPointsRef}>
            <DraggingContext.Provider value={isDraggingRef}>
                <DampingContext.Provider value={dampingRef}>
                
                <div className="container mx-auto pb-6 flex flex-col" ref={gameRef} style={{height}}>
                    <div className="flex flex-col md:flex-row flex-1">
                        <div className="border b-1 border-x-0 md:border-x-1 border-black h-[50%] md:h-[100%] w-full md:w-1/2">
                            <Draw setSvgData={setSvgData} threedyPoints={threedyPointsRef} setIsDrawing={setIsDrawing}/>
                        </div>
                        <div className="border b-1 border-x-0 md:border-r-1 border-t-0 md:border-t-1 border-black h-[50%] md:h-[100%] w-full md:w-1/2">
                            <Threedy svgData={svgData} updatePoints={updatePoints} setIsDragging={updateDragging} isDrawing={isDrawing}/>
                        </div>
                    </div>
                    <Controls reset={reset} setDamping={callSetDamping} />
                </div>
                </DampingContext.Provider>
            </DraggingContext.Provider>
        </ThreedyPointsContext.Provider>
    );
}

export default Body;
