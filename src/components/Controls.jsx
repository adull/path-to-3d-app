import { useState } from 'react'
import DampingContext from '../context/DampingContext'

const Controls = ({ reset, setDamping }) => {
    const [damping, fuckingSetDamping] = useState(4)
      
    // const dampingRef = useContext(DampingContext)

    const iHateReact = (val) => {
        fuckingSetDamping(val)
        setDamping(val)
    }


    return (
        <div className={`flex justify-between`}>
            <div className={`flex`}>
                <div style={{marginRight: 5}}>Stiffness</div>
                <input value={damping} onChange={(e) => iHateReact(e.target.value)} min={1} max={100} type="range"></input>
            </div>
            <div className={`flex`}>
                <a href="#" onClick={reset} style={{marginRight: 5}}>Reset</a>
            </div>
        </div>
    )
}

export default Controls