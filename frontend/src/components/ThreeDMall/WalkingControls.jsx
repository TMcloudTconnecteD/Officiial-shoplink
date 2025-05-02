import React, { useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';

const WalkingControls = ({ onMove }) => {
  const { camera } = useThree();
  const [moveForward, setMoveForward] = useState(false);
  const [moveBackward, setMoveBackward] = useState(false);
  const [moveLeft, setMoveLeft] = useState(false);
  const [moveRight, setMoveRight] = useState(false);
  const [canJump, setCanJump] = useState(false);
  const velocity = React.useRef({ x: 0, y: 0, z: 0 });
  const direction = React.useRef({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    const onKeyDown = (event) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          setMoveForward(true);
          break;
        case 'ArrowLeft':
        case 'KeyA':
          setMoveLeft(true);
          break;
        case 'ArrowDown':
        case 'KeyS':
          setMoveBackward(true);
          break;
        case 'ArrowRight':
        case 'KeyD':
          setMoveRight(true);
          break;
        case 'Space':
          if (canJump) velocity.current.y += 5;
          setCanJump(false);
          break;
        default:
          break;
      }
    };

    const onKeyUp = (event) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          setMoveForward(false);
          break;
        case 'ArrowLeft':
        case 'KeyA':
          setMoveLeft(false);
          break;
        case 'ArrowDown':
        case 'KeyS':
          setMoveBackward(false);
          break;
        case 'ArrowRight':
        case 'KeyD':
          setMoveRight(false);
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, [canJump]);

  useFrame((state, delta) => {
    direction.current.z = Number(moveForward) - Number(moveBackward);
    direction.current.x = Number(moveRight) - Number(moveLeft);
    direction.current.y = 0;

    velocity.current.x -= velocity.current.x * 10.0 * delta;
    velocity.current.z -= velocity.current.z * 10.0 * delta;

    const speed = 5.0;

    velocity.current.x += direction.current.x * speed * delta;
    velocity.current.z += direction.current.z * speed * delta;

    camera.position.x += velocity.current.x;
    camera.position.z += velocity.current.z;

    onMove && onMove(camera.position);
  });

  return null;
};

export default WalkingControls;
