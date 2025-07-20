import { useEffect, useState, useRef, useMemo } from 'react'
import { paper } from 'paper'

const Draw = ({ setSvgData, threedyPoints }) => {
    const parentRef = useRef(null)
    const childRef = useRef(null)
    const [display, setDisplay] = useState({ width: 0, height: 0})

    const memoizedThreedyPoints = useMemo(() => threedyPoints, [JSON.stringify(threedyPoints)]);

    useEffect(() => {
        const width = parentRef.current?.clientWidth ? parentRef.current.clientWidth : 0
        let height = parentRef.current?.clientHeight ? parentRef.current.clientHeight : 0
        // if(height > width) height = window.innerHeight / 2
        
        // console.log({ width, height })
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

    useEffect(() => {
        if (!paper || !paper.view) return;

        // Remove old path if it exists
        const existing = paper.project.getItem({ name: 'bruh' });
        if (existing) existing.remove();
      
        if (memoizedThreedyPoints.length === 0) return;
      
        const viewBounds = paper.view.bounds;
        const padding = 20;
      
        // 1. Get bounding box of points
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
      
        memoizedThreedyPoints.forEach(({ x, y }) => {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        });
      
        const dataWidth = maxX - minX;
        const dataHeight = maxY - minY;
      
        const scaleX = (viewBounds.width - padding * 2) / dataWidth;
        const scaleY = (viewBounds.height - padding * 2) / dataHeight;
        const scale = Math.min(scaleX, scaleY); // Maintain aspect ratio
      
        const offsetX = viewBounds.left + padding;
        const offsetY = viewBounds.top + padding;
      
        // 2. Create new path with transformed points
        const path = new paper.Path({
          strokeColor: 'red',
          strokeWidth: 2,
          name: 'bruh'
        });
      
        memoizedThreedyPoints.forEach(({ x, y }) => {
          const normalizedX = (x - minX) * scale + offsetX;
          const flippedY = maxY - y;
          const normalizedY = ((flippedY - minY) * scale + offsetY);
          path.add(new paper.Point(normalizedX, normalizedY));
        });
      
        return () => {
          path.remove();
        };
    }, [memoizedThreedyPoints])

    const erase = () => {
        console.log(`this is hooked up`)
        const project = paper.project

        console.log({ al: project.activeLayer.children })
        const layer = project._children[0]
        const path = layer._children[0]
        path.segments = []
    }

    return (
        <div className="w-full h-full flex flex-col" ref={parentRef}>
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
