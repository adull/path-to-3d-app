// str can be a whole svg or a path or even the d= itself.
// simple function that finds the d=".." and returns that. 
// if theres an <svg that has multiple paths, it will only get the first <path's d.
// if there isn't a d, it will just return the string itself.
const extractPathData = (str) => {
    if(!str) return ''

    const decoded = decodeURIComponent(str)
    const indexD = decoded.indexOf(`d=`)

    const quote = decoded[indexD + 2]
    const sliced = decoded.slice(indexD + 3, str.length)
    const indexCloseQuote = sliced.indexOf(quote)

    return indexD > 0 && indexCloseQuote > 0 ? sliced.slice(0, indexCloseQuote) : decoded
}


// this takes an array properties which comes from npm library svg-path-properties
// bless this library's heart - the idea is great but it creates pretty low res
// results. in particular it does a bad job around "inflection points"
// this function runs the library's .getParts() function and then also figures out the parts of the results that need higher 
const propertiesToParts = ({ properties, interval }) => {
    const _parts = properties.getParts()
    const ipl = properties.inst.partial_lengths
    _parts.push(ipl[ipl.length])

    // const interval = 150
    const numSamples = Math.ceil(properties.getTotalLength() / interval)

    let prevAngle = null
    let tolerance = Math.PI / 180 * 5 
    const controlPoints = []

    for (let i = 0; i <= numSamples; i++) {
        const len = i * interval
        const tangent = properties.getTangentAtLength(len)
        const angle = Math.atan2(tangent.y, tangent.x)

        if (prevAngle !== null) {
            const delta = Math.abs(angle - prevAngle)
            if (delta > tolerance) {
            controlPoints.push(len)
            }
        }

        prevAngle = angle
    }

    const additionalPoints = []

    controlPoints.forEach(len => {
      for (let offset = -5; offset <= 5; offset++) {
        const adjustedLen = len + offset * 0.1
        if (adjustedLen >= 0 && adjustedLen <= properties.getTotalLength()) {
          additionalPoints.push(adjustedLen)
        }
      }
    })

    const allLengths = [...properties.inst.partial_lengths, ...additionalPoints]
    .filter(v => !isNaN(v))
    .sort((a, b) => a - b)

    const parts = []

    
    for(let i = 0; i < allLengths.length -1; i ++) {
      const p1 = properties.getPointAtLength(allLengths[i])
      const p2 = properties.getPointAtLength(allLengths[i + 1])


      // svg vs 3d space
      p1.y *= -1
      p2.y *= -1

      const dx = p2.x - p1.x
      const dy = p2.y - p1.y
      const length = Math.sqrt(dx * dx + dy * dy)
      const angle = Math.atan2(dy, dx)

      parts.push({
        start: p1,
        end: p2,
        length,
        angle,
      })
    }
    return parts
}


const dumbPropToPart = ({ properties }) => {
  const _parts = properties.getParts()
    const ipl = properties.inst.partial_lengths
    _parts.push(ipl[ipl.length])

    // const interval = 150
    // const numSamples = Math.ceil(properties.getTotalLength() / interval)

    // let prevAngle = null
    // let tolerance = Math.PI / 180 * 5 
    // const controlPoints = []

    // for (let i = 0; i <= numSamples; i++) {
    //     const len = i * interval
    //     const tangent = properties.getTangentAtLength(len)
    //     const angle = Math.atan2(tangent.y, tangent.x)

    //     if (prevAngle !== null) {
    //         const delta = Math.abs(angle - prevAngle)
    //         if (delta > tolerance) {
    //         controlPoints.push(len)
    //         }
    //     }

    //     prevAngle = angle
    // }

    const additionalPoints = []

    // controlPoints.forEach(len => {
    //   for (let offset = -5; offset <= 5; offset++) {
    //     const adjustedLen = len + offset * 0.1
    //     if (adjustedLen >= 0 && adjustedLen <= properties.getTotalLength()) {
    //       additionalPoints.push(adjustedLen)
    //     }
    //   }
    // })

    const allLengths = [...properties.inst.partial_lengths, ...additionalPoints]
    .filter(v => !isNaN(v))
    .sort((a, b) => a - b)

    const parts = []

    
    for(let i = 0; i < allLengths.length -1; i ++) {
      const p1 = properties.getPointAtLength(allLengths[i])
      const p2 = properties.getPointAtLength(allLengths[i + 1])


      // svg vs 3d space
      p1.y *= -1
      p2.y *= -1

      const dx = p2.x - p1.x
      const dy = p2.y - p1.y
      const length = Math.sqrt(dx * dx + dy * dy)
      const angle = Math.atan2(dy, dx)
      // const angle = 0

      parts.push({
        start: p1,
        end: p2,
        length,
        angle,
      })
    }
    return parts
}

const smartPropToPart = ({properties}) => {
  const _parts = properties.getParts()
    const ipl = properties.inst.partial_lengths
    _parts.push(ipl[ipl.length])

    const additionalPoints = []
    const parts = []

    // controlPoints.forEach(len => {
    //   for (let offset = -5; offset <= 5; offset++) {
    //     const adjustedLen = len + offset * 0.1
    //     if (adjustedLen >= 0 && adjustedLen <= properties.getTotalLength()) {
    //       additionalPoints.push(adjustedLen)
    //     }
    //   }
    // })

    const allLengths = [...properties.inst.partial_lengths, ...additionalPoints]
    .filter(v => !isNaN(v))
    .sort((a, b) => a - b)

  const MIN_CLUSTER_SIZE = 3
const MAX_CLUSTER_LENGTH = 4  // adjust this threshold

for (let i = 0; i < allLengths.length - 1; ) {
  let clusterStart = i
  let clusterEnd = i + 1
  let totalLength = 0

  while (
    clusterEnd < allLengths.length &&
    totalLength < MAX_CLUSTER_LENGTH &&
    clusterEnd - clusterStart < 10
  ) {
    const pA = properties.getPointAtLength(allLengths[clusterEnd - 1])
    const pB = properties.getPointAtLength(allLengths[clusterEnd])
    pA.y *= -1
    pB.y *= -1

    const dx = pB.x - pA.x
    const dy = pB.y - pA.y
    totalLength += Math.sqrt(dx * dx + dy * dy)

    if (totalLength < MAX_CLUSTER_LENGTH) {
      clusterEnd++
    }
  }

  const clusterSize = clusterEnd - clusterStart

  if (clusterSize >= MIN_CLUSTER_SIZE) {
    // Merge cluster
    const p1 = properties.getPointAtLength(allLengths[clusterStart])
    const p2 = properties.getPointAtLength(allLengths[clusterEnd])

    p1.y *= -1
    p2.y *= -1

    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    const length = Math.sqrt(dx * dx + dy * dy)
    const angle = Math.atan2(dy, dx)

    parts.push({
      start: p1,
      end: p2,
      length,
      angle,
    })

    i = clusterEnd // Skip over merged cluster
  } else {
    // Just push normal segment
    const p1 = properties.getPointAtLength(allLengths[i])
    const p2 = properties.getPointAtLength(allLengths[i + 1])

    p1.y *= -1
    p2.y *= -1

    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    const length = Math.sqrt(dx * dx + dy * dy)
    const angle = Math.atan2(dy, dx)

    parts.push({
      start: p1,
      end: p2,
      length,
      angle,
    })

    i++
  }
}
return parts

}

const getMaxVals = (pts) => {
  let [minX, minY] = [Infinity, Infinity]
  let [maxX, maxY] = [-Infinity, -Infinity]
  let [x, y] = [0,0]
  pts.forEach(point => {
      // console.log({ point })
      x = point.x
      y = point.y

      if(x < minX) { minX = x } 
      if(x > maxX) { maxX = x }
      if(y < minY) { minY = y }
      if(y > maxY) { maxY = y }
  })
  
  return {minX , maxX, minY, maxY}
}

export { extractPathData, propertiesToParts, smartPropToPart, dumbPropToPart, getMaxVals }