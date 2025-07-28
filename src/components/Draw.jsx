import { useEffect, useState, useRef, useContext } from 'react'
import { paper } from 'paper'
import ThreedyPointsContext from '../context/ThreedyPointsContext'

const Draw = ({ setSvgData, threedyPoints, setIsDrawing }) => {
    const parentRef = useRef(null)
    const childRef = useRef(null)
    const [display, setDisplay] = useState({ width: 0, height: 0})
    const uhh = useContext(ThreedyPointsContext)
    console.log({ uhh })

    useEffect(() => {
        const width = parentRef.current?.clientWidth ? parentRef.current.clientWidth : 0
        let height = parentRef.current?.clientHeight ? parentRef.current.clientHeight : 0
        // let height = 700
        // if(height > width) height = window.innerHeight / 2
        
        // console.log({ width, height })
        setDisplay({ width, height })
        
        // setPath(new paper.Path({ strokeColor: 'black', strokeWidth: 2 }))

        
    }, [])
    useEffect(() => {
        paper.setup("paper")
        new paper.Path({ strokeColor: 'black', strokeWidth: 8, strokeCap: 'round', name: 'bruh' })
        
        const view = paper.view

        const updateSvg = () => {
            const thepath = paper.project.getItems({ name: 'bruh' })[0]
            const svgData = thepath.exportSVG({ asString: true })
            if(thepath.segments.length > 3) {
                setSvgData(svgData)
            }
        }

        view.onMouseDrag = (event) => {
            setIsDrawing(true)
            const find = paper.project.getItems({ name: 'bruh' })
            if(find.length === 0) {
                const path = new paper.Path({ strokeColor: 'black', strokeWidth: 8, strokeCap: 'round', name: 'bruh' })
                path.add(event.point)
            } else {
                const thepath = paper.project.getItems({ name: 'bruh' })[0]
                thepath.add(event.point)
            }
        }

        view.onMouseUp = () => {
            setIsDrawing(false)
            updateSvg()
        }
    }, [display])



    useEffect(() => {
        if (!paper || !paper.view) return;
      
        const path = new paper.Path({
          strokeColor: new paper.Color(0, 0, 0),
          strokeWidth: 8,
          name: 'bruh',
          strokeCap: 'round',
          data: {
            createdAt: performance.now()
          }
        });
      
        let lastPointCount = 0;
      
        paper.view.on('frame', () => {
            // console.log({uhh })
          if (!uhh.current) return;
      
          if (uhh.current.length > 0) {
            lastPointCount = uhh.current.length;
      
            // path.removeSegments(); // Clear previous drawing
            const find = paper.project.getItems({ name: 'bruh' })
            if(find.length !== 0) {
                find[0].remove()
            } 

            const path = new paper.Path({
                strokeColor: new paper.Color(0, 0, 0),
                strokeWidth: 8,
                name: 'bruh',
                strokeCap: 'round',
                data: {
                  createdAt: performance.now()
                }
              });


      
            if (lastPointCount === 0) return;
      
            const viewBounds = paper.view.bounds;
            const padding = 20;
      
            let minX = Infinity, minY = Infinity;
            let maxX = -Infinity, maxY = -Infinity;
      
            uhh.current.forEach(({ x, y }) => {
              if (x < minX) minX = x;
              if (y < minY) minY = y;
              if (x > maxX) maxX = x;
              if (y > maxY) maxY = y;
            });
      
            const dataWidth = maxX - minX;
            const dataHeight = maxY - minY;
      
            const scaleX = (viewBounds.width - padding * 2) / dataWidth;
            const scaleY = (viewBounds.height - padding * 2) / dataHeight;
            const scale = Math.min(scaleX, scaleY);
      
            const offsetX = viewBounds.left + padding;
            const offsetY = viewBounds.top + padding;
      
            uhh.current.forEach(({ x, y }) => {
              const normalizedX = (x - minX) * scale + offsetX;
              const flippedY = maxY - y;
              const normalizedY = flippedY * scale + offsetY;
              path.add(new paper.Point(normalizedX, normalizedY));
            });
          }
        });
      
        return () => {
          path.remove();
          paper.view.off('frame');
        };
      }, [uhh]);


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
                }}
            >                
            </canvas>
        </div>

    );
    }

export default Draw;
