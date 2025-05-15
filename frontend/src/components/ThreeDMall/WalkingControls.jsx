import React, { useEffect, useState, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';

const WalkingControls = ({ onMove }) => {
  const { camera, gl } = useThree();
  const [moveForward, setMoveForward] = useState(false);
  const [moveBackward, setMoveBackward] = useState(false);
  const [moveLeft, setMoveLeft] = useState(false);
  const [moveRight, setMoveRight] = useState(false);
  const [canJump, setCanJump] = useState(false);
  const velocity = useRef({ x: 0, y: 0, z: 0 });
  const direction = useRef({ x: 0, y: 0, z: 0 });
  const rotation = useRef({ x: 0, y: 0 });
  const pointerLocked = useRef(false);

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

    const onMouseMove = (event) => {
      if (!pointerLocked.current) return;
      const movementX = event.movementX || 0;
      const movementY = event.movementY || 0;
      rotation.current.y -= movementX * 0.002;
      rotation.current.x -= movementY * 0.002;
      rotation.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotation.current.x));
    };

    const onPointerLockChange = () => {
      pointerLocked.current = document.pointerLockElement === gl.domElement;
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('pointerlockchange', onPointerLockChange);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
    };
  }, [canJump, gl.domElement]);

  useFrame((state, delta) => {
    direction.current.z = Number(moveForward) - Number(moveBackward);
    direction.current.x = Number(moveRight) - Number(moveLeft);
    direction.current.y = 0;

    velocity.current.x -= velocity.current.x * 10.0 * delta;
    velocity.current.z -= velocity.current.z * 10.0 * delta;

    const speed = 5.0;

    velocity.current.x += direction.current.x * speed * delta;
    velocity.current.z += direction.current.z * speed * delta;

    // Calculate forward and right vectors based on rotation
    const forward = [
      Math.sin(rotation.current.y),
      0,
      Math.cos(rotation.current.y),
    ];
    const right = [
      Math.cos(rotation.current.y),
      0,
      -Math.sin(rotation.current.y),
    ];

    camera.position.x += forward[0] * velocity.current.z + right[0] * velocity.current.x;
    camera.position.z += forward[2] * velocity.current.z + right[2] * velocity.current.x;

    camera.rotation.x = rotation.current.x;
    camera.rotation.y = rotation.current.y;

    onMove && onMove(camera.position);
  });

  const handleClick = () => {
    if (!pointerLocked.current) {
      gl.domElement.requestPointerLock();
    }
  };

  return <mesh onClick={handleClick} />;
};

export default WalkingControls;
