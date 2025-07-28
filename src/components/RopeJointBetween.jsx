import { useContext } from 'react'
import { useSpringJoint } from '@react-three/rapier';
import DraggingContext from '../context/DraggingContext'

const RopeJointBetween = ({ length, bodyA, bodyB }) => {

  const isDragging = useContext(DraggingContext)

  useSpringJoint(bodyA, bodyB, [[0,0,0],[0,0,0],length + 1.2, isDragging ? 10000: 1000, 1])
};

export default RopeJointBetween;