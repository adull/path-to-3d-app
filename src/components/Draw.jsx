import { useEffect, useState, useRef } from 'react'
import { paper } from 'paper'

const Draw = ({ setSvgData }) => {
    const parentRef = useRef(null)
    const childRef = useRef(null)
    const [display, setDisplay] = useState({ width: 0, height: 0})

    useEffect(() => {
        const width = parentRef.current?.clientWidth ? parentRef.current.clientWidth : 0
        let height = parentRef.current?.clientHeight ? parentRef.current.clientHeight : 0
        if(height > width) height = window.innerHeight / 2
        console.log({ width, height })
        setDisplay({ width, height })
        
        // setPath(new paper.Path({ strokeColor: 'black', strokeWidth: 2 }))

        
    }, [])
    useEffect(() => {
        paper.setup("paper")
        const path = new paper.Path({ strokeColor: 'black', strokeWidth: 2 })
        
        const view = paper.view

        const updateSvg = () => {
            const svgData = path.exportSVG({ asString: true })
            setSvgData(svgData)
        }

        view.onMouseDrag = (event) => {
            path.add(event.point)
        }

        view.onMouseUp = () => {
            updateSvg()
        }
    }, [display])

    const erase = () => {
        console.log(`this is hooked up`)
        const project = paper.project

        console.log({ al: project.activeLayer.children })
        const layer = project._children[0]
        const path = layer._children[0]
        path.segments = []
    }

    return (
        <div className="w-1/2 flex flex-col" ref={parentRef}>
            <canvas 
                id="paper"
                width={display.width}
                height={display.height}
                ref={childRef}
                style={{ 
                    position: `relative`, 
                    top: 0,
                    left: 0, 
                    // width: display.width,
                    height: display.height,
                    border: '1px solid black' 
                }}
            >                
            </canvas>
            <button onClick={erase}>erase</button>
        </div>

    );
    }

export default Draw;
