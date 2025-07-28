import { useState, useRef } from 'react'
import Draw from './Draw'
import Threedy from './Threedy'
import ThreedyPointsContext from '../context/ThreedyPointsContext'


const Body = () => {
    const [svgData, setSvgData] = useState(null)
    // const [threedyPoints, setThreedyPoints] = useState([])
    const threedyPointsRef = useRef([])
    const [isDrawing, setIsDrawing] = useState(false)

    const reset = () => {
        setSvgData(null)
        // setThreedyPoints([])
        threedyPointsRef.current = []
    }

    const hmm = (pts) => {
    //     // console.log({ pts})
        threedyPointsRef.current = pts
    }
    return (
        <ThreedyPointsContext.Provider value={threedyPointsRef}>
            <div className="container mx-auto pb-6 flex flex-col md:flex-row h-[70vh]" >
                <div className="border b-1 border-black h-[50%] md:h-[100%] w-full md:w-1/2">
                    <Draw setSvgData={setSvgData} threedyPoints={threedyPointsRef} setIsDrawing={setIsDrawing}/>
                </div>
                <div className="border b-1 border-l-1 md:border-l-0 border-t-0 md:border-t-1 border-black h-[50%] md:h-[100%] w-full md:w-1/2">
                    <Threedy svgData={svgData} updatePoints={hmm } isDrawing={isDrawing}/>
                </div>
                <div style={{position: `relative`, top: 50}} onClick={reset}>Reset</div>
            </div>
        </ThreedyPointsContext.Provider>
    );
}

export default Body;
