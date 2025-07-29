import { useContext } from 'react'
import { useSpringJoint } from '@react-three/rapier';
import ThreedyPointsContext from '../context/ThreedyPointsContext';

const RopeJointBetween = ({ length, bodyA, bodyB, stiffness }) => {

  const { dampingRef } = useContext(ThreedyPointsContext)
  const damping = dampingRef.current ? parseInt(dampingRef.current) : 10000

  function dampToStiffness(x) {
    if (x <= 1) return 15000;
    if (x >= 100) return 10;
  
    const a = 15000;     // starting value
    const b = Math.log(15000 / 10) / (100 - 1); // decay rate to reach 10 at x=100
  
    return Math.round(a * Math.exp(-b * (x - 1)));
  }
  // todo fix this stiffness
  useSpringJoint(bodyA, bodyB, [[0,0,0],[0,0,0],length + 1.2, dampToStiffness(damping), 1])

};

export default RopeJointBetween;