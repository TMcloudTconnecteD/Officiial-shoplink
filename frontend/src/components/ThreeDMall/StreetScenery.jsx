import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const StreetScenery = () => {
  const mountRef = useRef(null);
  const [showInterior, setShowInterior] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // sky blue

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2;

    // --- World Items --- //
    const groundGeometry = new THREE.PlaneGeometry(300, 300);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    const roadGeometry = new THREE.PlaneGeometry(20, 300);
    const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.position.y = 0.01;
    road.rotation.x = -Math.PI / 2;
    scene.add(road);

    // Street lights and electric lines
    const lightMaterial = new THREE.MeshStandardMaterial({ color: 0xffffaa });
    const poles = [];
    for (let i = -100; i <= 100; i += 20) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 10), lightMaterial);
      pole.position.set(-10, 5, i);
      scene.add(pole);
      poles.push(pole);

      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffaa }));
      lamp.position.set(-10, 10, i);
      scene.add(lamp);
    }

    // Electric lines between poles
    for (let i = 0; i < poles.length - 1; i++) {
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        poles[i].position,
        poles[i + 1].position,
      ]);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
      const line = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(line);
    }

    // Beauty Parlor
    const containerMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const beautyParlor = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 10), containerMaterial);
    beautyParlor.position.set(-20, 2, -40);
    beautyParlor.userData.isBeautyParlor = true;
    scene.add(beautyParlor);

    const beautyDoor = new THREE.Mesh(new THREE.BoxGeometry(2, 3, 0.2), new THREE.MeshStandardMaterial({ color: 0x654321 }));
    beautyDoor.position.set(-23, 1.5, -40);
    scene.add(beautyDoor);

    // School compound
    const schoolMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc00 });
    for (let i = 0; i < 3; i++) {
      const schoolBlock = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 10), schoolMaterial);
      schoolBlock.position.set(30, 2.5, -50 + i * 20);
      scene.add(schoolBlock);
    }

    // Hill
    const hill = new THREE.Mesh(new THREE.SphereGeometry(15, 32, 32), new THREE.MeshStandardMaterial({ color: 0x556b2f }));
    hill.scale.set(2, 0.6, 2);
    hill.position.set(-50, -5, 50);
    scene.add(hill);

    // Birds
    const birdMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const birds = [];
    for (let i = 0; i < 10; i++) {
      const bird = new THREE.Mesh(new THREE.SphereGeometry(0.2), birdMaterial);
      bird.position.set(Math.random() * 20 - 10, 15 + Math.random() * 5, Math.random() * 20 - 10);
      scene.add(bird);
      birds.push(bird);
    }

    // Moving car
    const car = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 4), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
    car.position.set(0, 0.5, 60);
    scene.add(car);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // Raycaster for door
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onMouseClick(event) {
      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children);
      if (intersects.length > 0) {
        const obj = intersects[0].object;
        if (obj.userData.isBeautyParlor) {
          setShowInterior(true);
        }
      }
    }

    mountRef.current.addEventListener('click', onMouseClick);

    // Animate everything
    let carDirection = 1;
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);

      birds.forEach((bird, i) => {
        bird.position.x += Math.sin(Date.now() * 0.001 + i) * 0.01;
        bird.position.z += Math.cos(Date.now() * 0.001 + i) * 0.01;
      });

      car.position.z -= 0.2 * carDirection;
      if (car.position.z < -60 || car.position.z > 60) {
        carDirection *= -1;
      }
    }
    animate();

return () => {
  if (mountRef.current) {
    mountRef.current.removeEventListener('click', onMouseClick);
    mountRef.current.removeChild(renderer.domElement);
  }
  controls.dispose();
};
  }, []);

  return (
    <>
      <div ref={mountRef} style={{ width: '100%', height: '100vh', position: 'relative' }} />
      {showInterior && (
        <div style={{ position: 'absolute', top: 20, left: 20 }}>
          <button onClick={() => setShowInterior(false)} style={{ padding: '10px 20px', fontSize: '16px' }}>
            Back to Street
          </button>
          <div style={{ color: 'white', marginTop: '10px' }}>
            <h2>Beauty Parlor Interior Coming Here</h2>
            {/* Put your BeautyParlorInterior canvas or model here if you have */}
          </div>
        </div>
      )}
    </>
  );
};

export default StreetScenery;
