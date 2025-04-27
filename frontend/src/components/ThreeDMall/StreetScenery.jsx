import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const StreetScenery = () => {
  const mountRef = useRef(null);

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
    camera.position.set(0, 5, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2;

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 }); // forest green
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Road
    const roadGeometry = new THREE.PlaneGeometry(20, 100);
    const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.position.z = 0;
    road.position.y = 0.01;
    road.rotation.x = -Math.PI / 2;
    scene.add(road);

    // Street lights
    const lightMaterial = new THREE.MeshStandardMaterial({ color: 0xffffaa });
    for (let i = -40; i <= 40; i += 20) {
      const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 5);
      const pole = new THREE.Mesh(poleGeometry, lightMaterial);
      pole.position.set(-10, 2.5, i);
      scene.add(pole);

      const lampGeometry = new THREE.SphereGeometry(0.3, 16, 16);
      const lamp = new THREE.Mesh(lampGeometry, new THREE.MeshBasicMaterial({ color: 0xffffaa }));
      lamp.position.set(-10, 5, i);
      scene.add(lamp);

      const pole2 = pole.clone();
      pole2.position.set(10, 2.5, i);
      scene.add(pole2);

      const lamp2 = lamp.clone();
      lamp2.position.set(10, 5, i);
      scene.add(lamp2);
    }

    // Container shops and apartment on one side of the road
    const containerMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const containerDoorMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const apartmentMaterial = new THREE.MeshStandardMaterial({ color: 0x999999 });

    // Two small container shops on left side
    for (let i = 0; i < 2; i++) {
      const container = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 10), containerMaterial);
      container.position.set(-20, 2, -20 + i * 15);
      scene.add(container);

      const door = new THREE.Mesh(new THREE.BoxGeometry(2, 3, 0.2), containerDoorMaterial);
      door.position.set(-23, 1.5, -20 + i * 15);
      scene.add(door);
    }

    // One large container shop on right side
    const largeContainer = new THREE.Mesh(new THREE.BoxGeometry(12, 6, 15), containerMaterial);
    largeContainer.position.set(20, 3, -10);
    scene.add(largeContainer);

    const largeDoor = new THREE.Mesh(new THREE.BoxGeometry(3, 4, 0.2), containerDoorMaterial);
    largeDoor.position.set(26, 2, -10);
    scene.add(largeDoor);

    // Apartment on right side near large container
    const apartment = new THREE.Mesh(new THREE.BoxGeometry(10, 12, 10), apartmentMaterial);
    apartment.position.set(20, 6, 15);
    scene.add(apartment);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // Animate
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      controls.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};

export default StreetScenery;
