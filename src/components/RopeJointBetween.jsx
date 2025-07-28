import { useState, useEffect, useContext } from 'react'
import { useSpringJoint } from '@react-three/rapier';
import DraggingContext from '../context/DraggingContext'

const RopeJointBetween = ({ length, bodyA, bodyB }) => {
  const [stiffness, setStiffness] = useState(10000);

  const isDragging = useContext(DraggingContext)

  // useEffect(() => {
  //   setTimeout(() => {
  //     console.log(`brother please`)
  //     setStiffness(10000); // full strength after settling
  //   }, 100); // ~2 frames
  //   // return () => clearTimeout(timeout);
  // }, []);

      useSpringJoint(bodyA, bodyB, [[0,0,0],[0,0,0],length + 1.2, isDragging ? 10000: 1000, 1])
  };

export default RopeJointBetween;