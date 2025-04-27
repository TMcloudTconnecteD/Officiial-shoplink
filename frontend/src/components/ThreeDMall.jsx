import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

function ThreeDMall() {
  const mountRef = useRef(null);
  const [show3DMall, setShow3DMall] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    // Clear previous scene if any
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    if (!show3DMall) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x20232a);

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = false;

    const ambientLight = new THREE.AmbientLight(0x404040, 1.2);
    scene.add(ambientLight);

    const neonColors = [0xff00ff, 0x00ffff, 0xffff00];
    let neonIndex = 0;
    const neonLight = new THREE.PointLight(neonColors[neonIndex], 1, 50);
    neonLight.position.set(15, 8, 7);
    scene.add(neonLight);

    let flickerInterval = setInterval(() => {
      neonIndex = (neonIndex + 1) % neonColors.length;
      neonLight.color.setHex(neonColors[neonIndex]);
    }, 500);

    // Road and sidewalks
    const roadGeometry = new THREE.PlaneGeometry(50, 10);
    const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.z = 0;
    scene.add(road);

    const sidewalkGeometry = new THREE.PlaneGeometry(50, 3);
    const sidewalkMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const sidewalkLeft = new THREE.Mesh(sidewalkGeometry, sidewalkMaterial);
    sidewalkLeft.rotation.x = -Math.PI / 2;
    sidewalkLeft.position.set(0, 0.01, -6.5);
    scene.add(sidewalkLeft);
    const sidewalkRight = new THREE.Mesh(sidewalkGeometry, sidewalkMaterial);
    sidewalkRight.rotation.x = -Math.PI / 2;
    sidewalkRight.position.set(0, 0.01, 6.5);
    scene.add(sidewalkRight);

    // School building and sign
    const schoolGeometry = new THREE.BoxGeometry(15, 8, 10);
    const schoolMaterial = new THREE.MeshStandardMaterial({ color: 0x6699cc });
    const school = new THREE.Mesh(schoolGeometry, schoolMaterial);
    school.position.set(-25, 4, 15);
    scene.add(school);

    const schoolSignGeometry = new THREE.PlaneGeometry(8, 2);
    const schoolSignMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const schoolSign = new THREE.Mesh(schoolSignGeometry, schoolSignMaterial);
    schoolSign.position.set(-25, 8.5, 20);
    scene.add(schoolSign);

    // Cars
    const cars = [];
    const carBodyGeometry = new THREE.BoxGeometry(3, 1, 6);
    const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.5, 16);
    wheelGeometry.rotateZ(Math.PI / 2);
    const carMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });

    for (let i = 0; i < 3; i++) {
      const car = new THREE.Group();

      const body = new THREE.Mesh(carBodyGeometry, carMaterial.clone());
      body.position.y = 1;
      car.add(body);

      for (let j = 0; j < 4; j++) {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.position.set(j < 2 ? -1 : 1, 0.5, j % 2 === 0 ? -2 : 2);
        car.add(wheel);
      }

      car.position.set(-20 + i * 20, 0, (i % 2 === 0 ? -3 : 3));
      scene.add(car);
      cars.push(car);
    }

    // Mall building and neon sign
    const mallGeometry = new THREE.BoxGeometry(20, 10, 15);
    const mallMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const mall = new THREE.Mesh(mallGeometry, mallMaterial);
    mall.position.set(15, 5, 0);
    scene.add(mall);

    const neonSignGeometry = new THREE.PlaneGeometry(12, 3);
    const neonSignMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff });
    const neonSign = new THREE.Mesh(neonSignGeometry, neonSignMaterial);
    neonSign.position.set(15, 9, 7.6);
    scene.add(neonSign);

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.font = 'bold 80px Arial';
    ctx.fillStyle = '#ff00ff';
    ctx.textAlign = 'center';
    ctx.fillText('ShopLink', canvas.width / 2, 90);
    const texture = new THREE.CanvasTexture(canvas);
    neonSignMaterial.map = texture;
    neonSignMaterial.needsUpdate = true;

    // Door to enter mall
    const doorGeometry = new THREE.BoxGeometry(4, 7, 0.5);
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(15, 3.5, 7.75);
    scene.add(door);

    // Step simulation variables
    const steps = [
      { position: new THREE.Vector3(0, 5, 20), rotationY: 0 },
      { position: new THREE.Vector3(5, 5, 10), rotationY: Math.PI / 4 },
      { position: new THREE.Vector3(10, 5, 5), rotationY: Math.PI / 2 },
      { position: new THREE.Vector3(15, 5, 0), rotationY: Math.PI },
      { position: new THREE.Vector3(15, 5, 5), rotationY: Math.PI },
      { position: new THREE.Vector3(15, 5, 7), rotationY: Math.PI },
      { position: new THREE.Vector3(15, 5, 8), rotationY: Math.PI },
    ];
    let currentStep = 0;

    // UI button to move steps forward/back and toggle 3D view
    const button = document.createElement('button');
    button.style.position = 'fixed';
    button.style.top = '20px';
    button.style.left = '20px';
    button.style.zIndex = '100000';
    button.style.padding = '10px 20px';
    button.style.fontSize = '16px';
    button.style.borderRadius = '8px';
    button.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
    button.style.backgroundColor = '#fff';
    button.style.border = '1px solid #ccc';
    button.style.cursor = 'pointer';
    button.innerText = 'Go Back Home';

    button.onclick = () => {
      setShow3DMall(false);
    };
    mountRef.current.appendChild(button);

    // Function to update camera position and rotation based on current step
    function updateCameraStep() {
      const step = steps[currentStep];
      camera.position.copy(step.position);
      camera.rotation.set(0, step.rotationY, 0);
      controls.target.set(step.position.x + Math.sin(step.rotationY), step.position.y, step.position.z - Math.cos(step.rotationY));
      controls.update();
    }

    updateCameraStep();

    // Advance step on spacebar, go back on backspace
    function onKeyDown(event) {
      if (!show3DMall) return;
      if (event.code === 'Space') {
        currentStep = Math.min(currentStep + 1, steps.length - 1);
        updateCameraStep();
      } else if (event.code === 'Backspace') {
        currentStep = Math.max(currentStep - 1, 0);
        updateCameraStep();
      }
    }
    window.addEventListener('keydown', onKeyDown);

    // Animate cars moving along the road
    let carSpeed = 0.1;
    function animate() {
      requestAnimationFrame(animate);

      cars.forEach((car, idx) => {
        car.position.x += carSpeed * (idx % 2 === 0 ? 1 : -1);
        if (car.position.x > 25) car.position.x = -25;
        if (car.position.x < -25) car.position.x = 25;
      });

      // Flicker neon sign brightness
      neonSignMaterial.opacity = 0.7 + 0.3 * Math.sin(Date.now() * 0.01);
      neonSignMaterial.transparent = true;

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      clearInterval(flickerInterval);
      window.removeEventListener('keydown', onKeyDown);
      if (mountRef.current && button.parentNode === mountRef.current) {
        mountRef.current.removeChild(button);
      }
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      controls.dispose();
    };
  }, [show3DMall]);

  return (
    <>
      <button
        onClick={() => setShow3DMall(!show3DMall)}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 100000,
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          backgroundColor: '#fff',
          border: '1px solid #ccc',
        }}
      >
        {show3DMall ? 'Go Back Home' : 'View 3D Mall'}
      </button>
      <div ref={mountRef} style={{ width: '100%', height: '100vh', position: 'relative' }} />
    </>
  );
}

export default ThreeDMall;
