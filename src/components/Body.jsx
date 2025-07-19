import { useState } from 'react'
import Draw from './Draw'
import Threedy from './Threedy'

const Body = () => {
    const [svgData, setSvgData] = useState(null)
    return (
	<div className="container mx-auto pb-6 flex flex-col md:flex-row ">
        <div className="border b-1 border-black w-1 md:w-1/2">
            <Draw setSvgData={setSvgData}/>
        </div>
        <div className="border b-1 border-black w-1 md:w-1/2">
            <Threedy svgData={svgData}/>
        </div>
        
    </div>

    );
}

export default Body;
