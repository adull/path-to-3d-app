import { useContext } from 'react'
import { useSpringJoint } from '@react-three/rapier';
import ThreedyPointsContext from '../context/ThreedyPointsContext';

const RopeJointBetween = ({ length, bodyA, bodyB }) => {

  const { isDraggingRef } = useContext(ThreedyPointsContext)
  // console.log(`umm`)
  console.log(isDraggingRef.current)

  useSpringJoint(bodyA, bodyB, [[0,0,0],[0,0,0],length + 1.2, isDraggingRef.current ? 10 : 10000, 1])
  // useSpringJoint(bodyA, bodyB, [[0,0,0],[0,0,0],length + 1.2, 10000, 1])

};

export default RopeJointBetween;