import { useState } from 'react'

const Controls = ({ reset, colorTracing, setColorTracing, setDamping }) => {
    const [damping, fuckingSetDamping] = useState(4)
      
    // const dampingRef = useContext(DampingContext)

    const iHateReact = (val) => {
        fuckingSetDamping(val)
        setDamping(val)
    }


    return (
            <form className={`flex justify-between`}>
                <div className={`flex`}>
                    <label type="label" style={{marginRight: 5}}>Stiffness</label>

                    <input value={damping} onChange={(e) => iHateReact(e.target.value)} min={1} max={15} type="range"></input>
                </div>
                <div className={`flex`}>
                    <label style={{marginRight: 5}}>Color Tracing</label>
                    <input checked={colorTracing} onChange={(e) => { setColorTracing(e.target.checked) }} type="checkbox"></input>
                </div>
                <div className={`flex`}>
                    <a href="#" onClick={reset} style={{marginRight: 5}}>Reset</a>
                </div>
            </form>
            
    )
}

export default Controls