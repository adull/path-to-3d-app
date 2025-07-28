import { useEffect, useState, useRef, useContext } from 'react'
import { paper } from 'paper'
import ThreedyPointsContext from '../context/ThreedyPointsContext'

const Draw = ({ setSvgData, setIsDrawing }) => {
    const parentRef = useRef(null)
    const childRef = useRef(null)
    const [display, setDisplay] = useState({ width: 0, height: 0})
    const threedyPoints = useContext(ThreedyPointsContext)
    // const [initScale, setInitScale] = useState(0)
    const initScaleRef = useRef(0)

    

    useEffect(() => {
        const width = parentRef.current?.clientWidth ? parentRef.current.clientWidth : 0
        let height = parentRef.current?.clientHeight ? parentRef.current.clientHeight : 0
        // let height = 700
        // if(height > width) height = window.innerHeight / 2
        
        // console.log({ width, height })
        setDisplay({ width, height })
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
      
        paper.view.on('frame', (event) => {
            const elapsed = event.time;
          const find = paper.project.getItems({ name: 'bruh' })
        //   console.log({ find })
          if (!threedyPoints.current || find.length === 0) return;
        //   console.log(`i make it ehre??`)
      
          if (threedyPoints.current.length > 0) {
            lastPointCount = threedyPoints.current.length;
      
            // path.removeSegments(); // Clear previous drawing
            if(find.length !== 0) {
                // find[0].remove()
            } 

            const path = new paper.Path({
                // strokeColor: new paper.Color(0, 0, 0),
                strokeColor: 'red',
                strokeWidth: 8,
                name: 'bruh',
                strokeCap: 'round',
                data: {
                  createdAt: performance.now()
                }
              });


      
            if (lastPointCount === 0) return;
      
            const viewBounds = paper.view.bounds;
            let padding = 20;
            let xPadding = 0
            let yPadding = 0
      
            let minX = Infinity, minY = Infinity;
            let maxX = -Infinity, maxY = -Infinity;

      
            threedyPoints.current.forEach(({ x, y }) => {
              if (x < minX) minX = x;
              if (y < minY) minY = y;
              if (x > maxX) maxX = x;
              if (y > maxY) maxY = y;
            });
      
            let dataWidth = maxX - minX;
            let dataHeight = maxY - minY;

            // first time we scale
            if(initScaleRef.current === 0) {
                let _minX = Infinity, _minY = Infinity;
                let _maxX = -Infinity, _maxY = -Infinity;
                // console.log(find[0].segments)
                find[0].segments.forEach((segment) => {
                    // console.log(segment.point.x)
                    const x  = segment.point.x
                    const y = segment.point.y
                    if (x < _minX) _minX = x;
                    if (y < _minY) _minY = y;
                    if (x > _maxX) _maxX = x;
                    if (y > _maxY) _maxY = y;
                  });

                  console.log({_minX, _maxX, _minY, _maxY})
                  let drawnWidth = _maxX - _minX
                  let drawnHeight = _maxY - _minY
                  xPadding =_minX
                //   yPadding = viewBounds.height - _maxY 
                yPadding = _maxY - (_maxY - _minY)
                console.log({yPadding})


                  const scaleX = (drawnWidth) / dataWidth;
            const scaleY = (drawnHeight) / dataHeight;
            console.log({ scaleX, scaleY})
            const scale = Math.min(scaleX, scaleY);
      
            console.log({viewBounds})
            const offsetX = xPadding;
            const offsetY = yPadding;
      
            threedyPoints.current.forEach(({ x, y }) => {
                // console.log(`point`)
              const normalizedX = (x - minX) * scale + offsetX;
              const flippedY = maxY - y;
              const normalizedY = flippedY * scale + offsetY;
            //   console.log({ path, normalizedX, normalizedY})
              path.add(new paper.Point(normalizedX, normalizedY));
            });
                initScaleRef.current = 10
            }
      
            // const scaleX = (viewBounds.width - padding * 2) / dataWidth;
            // const scaleY = (viewBounds.height - padding * 2) / dataHeight;
            // const scale = Math.min(scaleX, scaleY);
      
            // const offsetX = viewBounds.left + padding;
            // const offsetY = viewBounds.top + padding;
      
            // threedyPoints.current.forEach(({ x, y }) => {
            //   const normalizedX = (x - minX) * scale + offsetX;
            //   const flippedY = maxY - y;
            //   const normalizedY = flippedY * scale + offsetY;
            //   path.add(new paper.Point(normalizedX, normalizedY));
            // });
          } else {
            // console.log(`reset huh?`)
            // const find = paper.project.getItems({ name: 'bruh' })
            // if(find.length !== 0) {
            //     find[0].remove()
            // } 
          }
        });
      
        return () => {
          path.remove();
          paper.view.off('frame');
        };
      }, []);


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
