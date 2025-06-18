import { useEffect, useState, useRef } from 'react'
import { paper } from 'paper'

const Draw = () => {
    const parentRef = useRef(null)
    const childRef = useRef(null)
    const [display, setDisplay] = useState({ width: 0, height: 0})

    useEffect(() => {
        // console.log(paperRef)
        const width = parentRef.current?.clientWidth ? parentRef.current.clientWidth : 0
        let height = parentRef.current?.clientHeight ? parentRef.current.clientHeight : 0
        if(height < width) height = window.innerHeight / 2
        setDisplay({ width, height })
        
        // setPath(new paper.Path({ strokeColor: 'black', strokeWidth: 2 }))

        
    }, [])
    useEffect(() => {
        paper.setup("paper")
        const path = new paper.Path({ strokeColor: 'black', strokeWidth: 2 })
        
        console.log(paper)
        const view = paper.view
        console.log({view})

        const updateSvg = () => {
            console.log(`updatesvg`)
            console.log({view, path})

            const svgString = path.exportSVG({ asString: true })
            console.log({ svgString })

        }


        view.onMouseDrag = (event) => {
            path.add(event.point)
        }

        view.onMouseUp = () => {
            updateSvg()
        }
    }, [display])

    const erase = () => {
        console.log(paper)
        const project = paper.project
        const layer = project._children[0]
        const path = layer._children[0]

        console.log({ project, layer, path })

        // this doesnt work come back to this 
        path.segments = []

    }



    return (
        <div class="w-1/2 flex flex-col" ref={parentRef}>
            <canvas 
                
                id="paper"
                width={display.width}
                height={display.height}
                ref={childRef}
                style={{ 
                    position: `relative`, 
                    top: 0,
                    left: 0, 
                    border: '1px solid black' 
                }}
            >                
            </canvas>
            <button onClick={erase}>erase</button>
        </div>

    );
    }

export default Draw;
