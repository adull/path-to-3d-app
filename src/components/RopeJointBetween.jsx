import { useSpringJoint, useSphericalJoint, useImpulseJoint, useFixedJoint, usePrismaticJoint, useRopeJoint } from '@react-three/rapier';

const RopeJointBetween = ({ length, bodyA, bodyB }) => {
    if(bodyA && bodyB) {
      // console.log({ length})
        // useSpringJoint(bodyA, bodyB, [[0,0,0],[0,0,0],-0.1, 1, 0.1]);
        useSpringJoint(bodyA, bodyB, [[0,0,0],[0,0,0],length - 0.1, 10000, 1])
        // useFixedJoint(bodyA, bodyB, [[0.5,0,0], [-0.5,0,0]])
        // useSphericalJoint(bodyA, bodyB, [[-0.5,0,0], [0.5,]])
        // usePrismaticJoint(bodyA, bodyB, [
        //   [-length, 0, 0],
        //   [0, length, 0],
        //   [length / 4, 0, 0],
        //   [-length / 2, length / 2]
        // ]);
        // useRopeJoint(bodyA, bodyB, [[0,0,0], [0,0,0],  0.2])
    }
    return null;
  };

export default RopeJointBetween;