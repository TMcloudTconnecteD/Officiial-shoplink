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

    // Controls disabled for step simulation
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = false;

    // Ambient and directional light with flickering neon effect
    const ambientLight = new THREE.AmbientLight(0x404040, 1.2);
    scene.add(ambientLight);

    const neonColors = [0xff00ff, 0x00ffff, 0xffff00];
    let neonIndex = 0;
    const neonLight = new THREE.PointLight(neonColors[neonIndex], 1, 50);
    neonLight.position.set(15, 8, 7);
    scene.add(neonLight);

    // Flicker neon light every 500ms
    let flickerInterval = setInterval(() => {
      neonIndex = (neonIndex + 1) % neonColors.length;
      neonLight.color.setHex(neonColors[neonIndex]);
    }, 500);

    // Street: road with moving cars and school nearby
    const roadGeometry = new THREE.PlaneGeometry(50, 10);
    const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.z = 0;
    scene.add(road);

    // Sidewalks
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

    // School building
    const schoolGeometry = new THREE.BoxGeometry(15, 8, 10);
    const schoolMaterial = new THREE.MeshStandardMaterial({ color: 0x6699cc });
    const school = new THREE.Mesh(schoolGeometry, schoolMaterial);
    school.position.set(-25, 4, 15);
    scene.add(school);

    // School sign
    const schoolSignGeometry = new THREE.PlaneGeometry(8, 2);
    const schoolSignMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const schoolSign = new THREE.Mesh(schoolSignGeometry, schoolSignMaterial);
    schoolSign.position.set(-25, 8.5, 20);
    scene.add(schoolSign);
