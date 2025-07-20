import { useEffect, useState, useRef, useMemo } from 'react'
import { paper } from 'paper'

const Draw = ({ setSvgData, threedyPoints }) => {
    const parentRef = useRef(null)
    const childRef = useRef(null)
    const [display, setDisplay] = useState({ width: 0, height: 0})

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
        const path = new paper.Path({ strokeColor: 'black', strokeWidth: 2, name: 'bruh' })
        
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

    // useEffect(() => {
    //     if (!paper || !paper.view || memoizedThreedyPoints.length === 0) return;
      
    //     const viewBounds = paper.view.bounds;
    //     const padding = 20;
      
    //     // 1. Remove nothing — keep all paths for now.
      
    //     // 2. Compute bounding box of points
    //     let minX = Infinity, minY = Infinity;
    //     let maxX = -Infinity, maxY = -Infinity;
      
    //     memoizedThreedyPoints.forEach(({ x, y }) => {
    //       if (x < minX) minX = x;
    //       if (y < minY) minY = y;
    //       if (x > maxX) maxX = x;
    //       if (y > maxY) maxY = y;
    //     });
      
    //     const dataWidth = maxX - minX;
    //     const dataHeight = maxY - minY;
      
    //     const scaleX = (viewBounds.width - padding * 2) / dataWidth;
    //     const scaleY = (viewBounds.height - padding * 2) / dataHeight;
    //     const scale = Math.min(scaleX, scaleY);
      
    //     const offsetX = viewBounds.left + padding;
    //     const offsetY = viewBounds.top + padding;
      
    //     // 3. Create new path with flipped + scaled points
    //     const path = new paper.Path({
    //       strokeColor: new paper.Color(1, 0, 0),
    //       strokeWidth: 2,
    //       name: 'bruh',
    //       data: {
    //         createdAt: performance.now()
    //       }
    //     });
      
    //     memoizedThreedyPoints.forEach(({ x, y }) => {
    //       const normalizedX = (x - minX) * scale + offsetX;
    //       const flippedY = maxY - y;
    //       const normalizedY = (flippedY - minY) * scale + offsetY;
    //       path.add(new paper.Point(normalizedX, normalizedY));
    //     });
      
    //     // 4. Animate color + remove old paths
    //     paper.view.onFrame = (event) => {
    //       const now = performance.now();
      
    //       paper.project.getItems({ name: 'bruh' }).forEach((item) => {
    //         const age = now - item.data.createdAt;
      
    //         // Animate color
    //         const hue = ((item.data.createdAt / 1000 + event.time) * 30) % 360;
    //         item.strokeColor = new paper.Color({
    //           hue,
    //           saturation: 1,
    //           brightness: 1
    //         });
      
    //         // Remove after 12s
    //         if (age > 12000) {
    //           item.remove();
    //         }
    //       });
    //     };
      
    //     return () => {
    //       // don’t remove paths here — let them live 12s
    //       // we could optionally clean up on unmount
    //     };
    //   }, [memoizedThreedyPoints]);
    useEffect(() => {
        if (!paper || !paper.view || threedyPoints.length === 0) return;

        paper.project.getItems({ name: 'bruh' }).forEach((item) => {
            item.remove()
        })
      
        const viewBounds = paper.view.bounds;
        const padding = 20;
      
        // 1. Remove nothing — keep all paths for now.
      
        // 2. Compute bounding box of points
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
      
        threedyPoints.forEach(({ x, y }) => {
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
      
        // 3. Create new path with flipped + scaled points
        const path = new paper.Path({
          strokeColor: new paper.Color(0, 0, 0),
          strokeWidth: 2,
          name: 'bruh',
          data: {
            createdAt: performance.now()
          }
        });
      
        threedyPoints.forEach(({ x, y }) => {
          const normalizedX = (x - minX) * scale + offsetX;
          const flippedY = maxY - y;
          const normalizedY = (flippedY - minY) * scale + offsetY;
          path.add(new paper.Point(normalizedX, normalizedY));
        });
      
        // 4. Animate color + remove old paths
        
      
        return () => {
          // don’t remove paths here — let them live 12s
          // we could optionally clean up on unmount
          path.remove()
        };
      }, [threedyPoints]);


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
