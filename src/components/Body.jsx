import { useState } from 'react'
import Draw from './Draw'
import Threedy from './Threedy'

const Body = () => {
    const [svgData, setSvgData] = useState(null)
    const [threedyPoints, setThreedyPoints] = useState([])

    const reset = () => {
        setSvgData(null)
        setThreedyPoints([])
    }
    return (
	<div className="container mx-auto pb-6 flex flex-col md:flex-row h-[70vh]" >
        <div className="border b-1 border-black h-[50%] md:h-[100%] w-full md:w-1/2">
            <Draw setSvgData={setSvgData} threedyPoints={threedyPoints} />
        </div>
        <div className="border b-1 border-l-1 md:border-l-0 border-t-0 md:border-t-1 border-black h-[50%] md:h-[100%] w-full md:w-1/2">
            <Threedy svgData={svgData} updatePoints={setThreedyPoints}/>
        </div>
        <div style={{position: `relative`, top: 50}} onClick={reset}>Reset</div>
    </div>
    );
}

export default Body;
