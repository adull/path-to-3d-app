import { useSpringJoint, useSphericalJoint, useImpulseJoint, useFixedJoint, usePrismaticJoint, useRopeJoint } from '@react-three/rapier';

const RopeJointBetween = ({ length, bodyA, bodyB }) => {
    if(bodyA && bodyB) {
        useSpringJoint(bodyA, bodyB, [[0,0,0],[0,0,0],length + 0.2, 10000, 1])
    }
    return null;
  };

export default RopeJointBetween;