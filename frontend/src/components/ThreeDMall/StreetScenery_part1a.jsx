import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const StreetSceneryPart1a = ({ onContainerClick }) => {
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
    camera.position.set(0, 5, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 100;
    controls.maxPolarAngle = Math.PI / 2;

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(150, 150);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 }); // forest green
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Road extended
    const roadGeometry = new THREE.PlaneGeometry(20, 150);
    const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.position.z = 0;
    road.position.y = 0.01;
    road.rotation.x = -Math.PI / 2;
    scene.add(road);

    // Street lights
    const lightMaterial = new THREE.MeshStandardMaterial({ color: 0xffffaa });
    for (let i = -60; i <= 60; i += 20) {
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
