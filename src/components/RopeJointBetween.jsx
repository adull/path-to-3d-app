import { useSpringJoint } from '@react-three/rapier';

const RopeJointBetween = ({ length, bodyA, bodyB }) => {
      useSpringJoint(bodyA, bodyB, [[0,0,0],[0,0,0],length + 0.2, 10000, 1])
  };

export default RopeJointBetween;