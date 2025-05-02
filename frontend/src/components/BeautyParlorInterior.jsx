import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useGetProductsQuery } from '../redux/api/productApiSlice';

const BeautyParlorInterior = () => {
  const mountRef = useRef(null);
  const { data, isLoading, error } = useGetProductsQuery({ keyword: 'Beauty Parlor' });

  useEffect(() => {
    if (!mountRef.current || isLoading || error) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Walls
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const wallThickness = 0.5;
    const wallHeight = 8;
    const roomSize = 20;

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(roomSize, wallHeight, wallThickness), wallMaterial);
    backWall.position.set(0, wallHeight / 2, -roomSize / 2);
    scene.add(backWall);

    const frontWall = new THREE.Mesh(new THREE.BoxGeometry(roomSize, wallHeight, wallThickness), wallMaterial);
    frontWall.position.set(0, wallHeight / 2, roomSize / 2);
    scene.add(frontWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, roomSize), wallMaterial);
    leftWall.position.set(-roomSize / 2, wallHeight / 2, 0);
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, roomSize), wallMaterial);
    rightWall.position.set(roomSize / 2, wallHeight / 2, 0);
    scene.add(rightWall);

    // Shelves for products
    const shelfGeometry = new THREE.BoxGeometry(12, 1, 2);
    const shelfMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
    shelf.position.set(0, 1, -5);
    scene.add(shelf);

    // Add products as boxes on shelf
    if (data && data.products) {
      const productCount = data.products.length;
      const spacing = 12 / (productCount + 1);
      data.products.forEach((product, index) => {
        const productGeometry = new THREE.BoxGeometry(1, 1, 1);
        const productMaterial = new THREE.MeshStandardMaterial({ color: 0xff69b4 });
        const productMesh = new THREE.Mesh(productGeometry, productMaterial);
        productMesh.position.set(-6 + spacing * (index + 1), 1.75, -5);
        productMesh.userData = { product };
        scene.add(productMesh);

        // Add click interaction
        productMesh.callback = () => {
          alert(`Product: ${product.name}\nPrice: $${product.price}`);
        };
      });
    }

    // Raycaster for interaction
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
        if (obj.callback) {
          obj.callback();
        }
      }
    }

    mountRef.current.addEventListener('click', onMouseClick);

    // Controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 30;
    controls.maxPolarAngle = Math.PI / 2;

    // Animate
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      mountRef.current.removeEventListener('click', onMouseClick);
      controls.dispose();
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [data, isLoading, error]);

  if (isLoading) return <p>Loading Beauty Parlor products...</p>;
  if (error) return <p>Error loading products.</p>;

  return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
};

export default BeautyParlorInterior;
