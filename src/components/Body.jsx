import { useState } from 'react'
import Draw from './Draw'
import Threedy from './Threedy'
import { TriggerProvider } from '../contexts/TriggerContext'

const Body = () => {
    const [svgData, setSvgData] = useState(null)
    return (
        <TriggerProvider>
            <div className="container mx-auto pb-6 flex flex-col md:flex-row ">
                <Draw setSvgData={setSvgData}/>
                <Threedy svgData={svgData}/>
            </div>
        </TriggerProvider>
    );
}

export default Body;
