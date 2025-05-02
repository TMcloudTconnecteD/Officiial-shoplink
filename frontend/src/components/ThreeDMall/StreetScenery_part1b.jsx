// Container shops and apartment on one side of the road
    const containerMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const containerDoorMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const apartmentMaterial = new THREE.MeshStandardMaterial({ color: 0x999999 });

    // Two small container shops on left side
    for (let i = 0; i < 2; i++) {
      const container = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 10), containerMaterial);
      container.position.set(-20, 2, -40 + i * 30);
      container.name = i === 0 ? 'Beauty Parlor' : 'Container Shop ' + (i + 1);
      scene.add(container);

      const door = new THREE.Mesh(new THREE.BoxGeometry(2, 3, 0.2), containerDoorMaterial);
      door.position.set(-23, 1.5, -40 + i * 30);
      scene.add(door);

      // Add click interaction for Beauty Parlor container
      if (i === 0) {
        container.userData = { isBeautyParlor: true };
      }
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
        if (obj.userData.isBeautyParlor) {
          onContainerClick();
        }
      }
    }

    mountRef.current.addEventListener('click', onMouseClick);

    // Animate
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      mountRef.current.removeEventListener('click', onMouseClick);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      controls.dispose();
    };
  }, [onContainerClick]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};

export default StreetSceneryPart1b;
