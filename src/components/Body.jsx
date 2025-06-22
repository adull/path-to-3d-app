import { useState } from 'react'
import Draw from './Draw'
import Threedy from './Threedy'

const Body = () => {
    const [svgData, setSvgData] = useState(null)
    return (
	<div className="container mx-auto pb-6 flex flex-col md:flex-row ">
        <Draw setSvgData={setSvgData}/>
        <Threedy svgData={svgData}/>
    </div>

    );
}

export default Body;
