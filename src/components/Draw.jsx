import { useEffect, useState, useRef, useContext } from 'react'
import { paper } from 'paper'
import { getMaxVals } from '../helpers/index'

import ThreedyPointsContext from '../context/ThreedyPointsContext'

const Draw = ({ setSvgData, colorTracing, resetVersion }) => {
    const parentRef = useRef(null)
    const childRef = useRef(null)
    const [display, setDisplay] = useState({ width: 0, height: 0})
    const {threedyPointsRef, isDraggingRef, timestampRef} = useContext(ThreedyPointsContext)
    const isDrawing = useRef(false)
    const currentFrameRef = useRef(1)
    const framesToEaseScaling = 1000
    const framesLeftToSkipRef = useRef(0) 
    const ctRef = useRef(colorTracing)


    useEffect(() => {
      console.log(colorTracing )
      ctRef.current = colorTracing
    }, [colorTracing])

    useEffect(() => {
        console.log(`useeffect [] draw`)
        const element = parentRef.current
        if (!element) return;
      
        const observer = new ResizeObserver((entries) => {
          for (let entry of entries) {
            const { width, height } = entry.contentRect;
            setDisplay({ width, height })

            const canvas = document.getElementById('paper')
            if(canvas) {
                paper.view.viewSize = new paper.Size(width, height)
                paper.view.update()
            }
          }
        });
      
        observer.observe(element);
      
        return () => {
          observer.unobserve(element);
          observer.disconnect();
        };
      }, []);

    useEffect(() => {
        paper.setup("paper")
        new paper.Path({ strokeColor: 'black', strokeWidth: 8, strokeCap: 'round', name: 'pathToFind' })
        
        const view = paper.view

        const updateSvg = () => {
            const thepath = paper.project.getItems({ name: 'pathToFind' })[0]

            if(thepath.segments.length > 3) {
                const svgData = thepath.exportSVG({ asString: true })
                setSvgData(svgData)
            }
        }

        view.onMouseDrag = (event) => {
            isDrawing.current = true
            const find = paper.project.getItems({ name: 'pathToFind' })
            if(find.length === 0) {
                const path = new paper.Path({ strokeColor: 'black', strokeWidth: 8, strokeCap: 'round', name: 'pathToFind' })
                path.add(event.point)
            } else {
                const thepath = paper.project.getItems({ name: 'pathToFind' })[0]
                thepath.add(event.point)
            }
        }

        view.onMouseUp = () => {
            isDrawing.current = false
            updateSvg()
        }
    }, [display])



    useEffect(() => {
        if (!paper || !paper.view) return;
      
        const path = new paper.Path({
          strokeColor: new paper.Color(0, 0, 0),
          strokeWidth: 8,
          name: 'pathToFind',
          strokeCap: 'round',
          data: {
            createdAt: performance.now()
          }
        });
      
        let lastPointCount = 0;
      
        paper.view.on('frame', () => {
            try {
                if(isDrawing.current || !timestampRef.current) return
                const elapsed = performance.now() - timestampRef.current;
                if (elapsed > 10000) return
                if(framesLeftToSkipRef.current > 0) {
                    console.log(framesLeftToSkipRef.current)
                    framesLeftToSkipRef.current = framesLeftToSkipRef.current - 1
                    return
                }
              const find = paper.project.getItems({ name: 'pathToFind' })
              if (!threedyPointsRef.current || find.length === 0) return;
              if(threedyPointsRef.current[threedyPointsRef.current.length - 1] === undefined) {
                framesLeftToSkipRef.current = 10
                return
              }
    
          
              if (threedyPointsRef.current.length > 0) {
                lastPointCount = threedyPointsRef.current.length;
                if (lastPointCount === 0) return;
          
                // path.removeSegments(); // Clear previous drawing
                const colors = [new paper.Color(0, 0, 0), new paper.Color(148, 0, 211), new paper.Color(75, 0, 130),new paper.Color(0, 0, 255),new paper.Color(0, 255, 0),new paper.Color(255, 255, 0),new paper.Color(255, 127, 0),new paper.Color(255, 0, 0)]
                const t = Math.floor(performance.now() / 100)
                const index = t % colors.length
                // console.log(ctRef.current)
                // console.log(colors[index])
                const path = new paper.Path({
                    strokeColor: ctRef.current ? colors[index] : new paper.Color(0, 0, 0),
                    strokeWidth: 8,
                    name: 'pathToFind',
                    strokeCap: 'round',
                    data: {
                      createdAt: performance.now()
                    }
                  });

                const viewBounds = paper.view.bounds;
                let padding = 20;
                let xPadding = 0
                let yPadding = 0
          
                let minX = Infinity, minY = Infinity;
                let maxX = -Infinity, maxY = -Infinity;
    
                // console.log({ptsss: threedyPointsRef.current})
                threedyPointsRef.current.forEach(item => {
                    if(!item?.x || !item?.y ) {
                        return
                    }
                    const { x, y } = item
                    if (x < minX) minX = x
                    if (y < minY) minY = y
                    if (x > maxX) maxX = x
                    if (y > maxY) maxY = y
                });
          
                let dataWidth = maxX - minX;
                let dataHeight = maxY - minY;
    
                // first time we scale
                if(currentFrameRef.current < framesToEaseScaling) {
                    const find = paper.project.getItems({ name: 'pathToFind' })
                    // console.log(find[0])
                    const pointsFromSegments = find[0].segments.map(segment => segment.point)
                    // console.log({viewBounds})
                    const maxVals = getMaxVals(pointsFromSegments)
                    // console.log({ maxVals})
    
                    
                      xPadding = maxVals.minX
                    // yPadding = viewBounds.height - maxVals.minY
                    yPadding = maxVals.minY
                    // console.log({xPadding, yPadding})
    
    
          
                // console.log({viewBounds})
                const offsetX = xPadding;
                const offsetY = yPadding;
    
                const scaleX = (viewBounds.width - padding * 2) / dataWidth;
                const scaleY = (viewBounds.height - padding * 2) / dataHeight;
                // console.log({scaleX, scaleY})
                // console.log({ scaleX })
                const scale = Math.min(scaleX, scaleY);
          
                const _offsetX = viewBounds.left + padding;
                const _offsetY = viewBounds.top + padding;
          
                threedyPointsRef.current.forEach(({ x, y }) => {
                    // console.log(`point`)
                  const normalizedX = (x - minX) + offsetX;
                  const _normalizedX = (x - minX) * scale + _offsetX;
                  const flippedY = maxY - y;
                  const normalizedY = flippedY + offsetY;
                  const _normalizedY = flippedY * scale + _offsetY;
    
                  const frameIndex = currentFrameRef.current
    
                  const t = frameIndex / framesToEaseScaling;
    
                const easeInOutQuart = (t) => t < 0.5
                            ? 8 * t * t * t * t
                            : 1 - Math.pow(-2 * t + 2, 4) / 2;
                const easedT = easeInOutQuart(t);
    
                const _x = normalizedX * (1 - easedT) + _normalizedX * easedT;
                const _y = normalizedY * (1 - easedT) + _normalizedY * easedT;
    
                path.add(new paper.Point(_x, _y));
    
                if(isDraggingRef.current) {
                    currentFrameRef.current = currentFrameRef.current + 1
                }
    
                });
                 
                } else {
                    const scaleX = (viewBounds.width - padding * 2) / dataWidth;
                  const scaleY = (viewBounds.height - padding * 2) / dataHeight;
                  const scale = Math.min(scaleX, scaleY);
            
                  const offsetX = viewBounds.left + padding;
                  const offsetY = viewBounds.top + padding;
            
                  threedyPointsRef.current.forEach(({ x, y }) => {
                    const normalizedX = (x - minX) * scale + offsetX;
                    const flippedY = maxY - y;
                    const normalizedY = flippedY * scale + offsetY;
                    path.add(new paper.Point(normalizedX, normalizedY));
                  });   
                }
    
                if(find.length !== 0) {
                  // console.log(colorTracing )
                  if(ctRef.current) {
                    if(find.length > 100) {
                      find[0].remove()
                      // return
                    }
                  } else {
                    find[0].remove()
                  }
                }
              }
            } catch(err) {
                const find = paper.project.getItems({ name: 'pathToFind' })
                if(find.length !== 0) {
                    find[0].remove()
                }

                console.log(err)
            }
            
        });
      
        return () => {
          path.remove();
          paper.view.off('frame');
        };
      }, []);

      useEffect(() => {
        const find = paper.project.getItems({ name: 'pathToFind' })
        if(find.length !== 0) {
          for(let i = 0; i < find.length; i ++) {
            find[i].remove()
          }
        }
      }, [resetVersion])

    console.log(`render draw`)
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
