import { useSpringJoint } from '@react-three/rapier';

const RopeJointBetween = ({ length, bodyA, bodyB }) => {
    if(bodyA && bodyB) {
        useSpringJoint(bodyA, bodyB, [[0,0,0],[0,0,0],length + 1.4, 100, 5]);
    }
    return null;
  };

export default RopeJointBetween;