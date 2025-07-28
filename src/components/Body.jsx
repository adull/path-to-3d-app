import { useState, useRef } from 'react'
import Draw from './Draw'
import Threedy from './Threedy'
import ThreedyPointsContext from '../context/ThreedyPointsContext'
import DraggingContext from '../context/DraggingContext'


const Body = () => {
    const [svgData, setSvgData] = useState(null)
    // const [threedyPoints, setThreedyPoints] = useState([])
    const threedyPointsRef = useRef([])
    const isDraggingRef = useRef(false)
    const [isDrawing, setIsDrawing] = useState(false)

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
    
    return (
        <ThreedyPointsContext.Provider value={threedyPointsRef}>
            <DraggingContext.Provider value={isDraggingRef}>
                <div className="container mx-auto pb-6 flex flex-col md:flex-row h-[70vh]" >
                    <div className="border b-1 border-x-0 md:border-x-1 border-black h-[50%] md:h-[100%] w-full md:w-1/2">
                        <Draw setSvgData={setSvgData} threedyPoints={threedyPointsRef} setIsDrawing={setIsDrawing}/>
                    </div>
                    <div className="border b-1 border-x-0 md:border-r-1 border-t-0 md:border-t-1 border-black h-[50%] md:h-[100%] w-full md:w-1/2">
                        <Threedy svgData={svgData} updatePoints={updatePoints} setIsDragging={updateDragging} isDrawing={isDrawing}/>
                    </div>
                    <div style={{position: `relative`, top: 50}} onClick={reset}>Reset</div>
                </div>
            </DraggingContext.Provider>
        </ThreedyPointsContext.Provider>
    );
}

export default Body;
