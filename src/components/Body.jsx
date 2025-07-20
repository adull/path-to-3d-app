import { useState } from 'react'
import Draw from './Draw'
import Threedy from './Threedy'

const Body = () => {
    const [svgData, setSvgData] = useState(null)
    const [threedyPoints, setThreedyPoints] = useState([])

    return (
	<div className="container mx-auto pb-6 flex flex-col md:flex-row h-[70vh]" >
        <div className="border b-1 border-black h-[50%] md:h-[100%] w-full md:w-1/2">
            <Draw setSvgData={setSvgData} threedyPoints={threedyPoints} />
        </div>
        <div className="border b-1 border-black h-[50%] md:h-[100%] w-full md:w-1/2">
            <Threedy svgData={svgData} updatePoints={setThreedyPoints}/>
        </div>
        
    </div>

    );
}

export default Body;
