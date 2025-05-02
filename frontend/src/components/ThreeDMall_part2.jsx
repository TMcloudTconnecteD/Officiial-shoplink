// More realistic car shapes (simple car body with wheels)
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

    // Mall building "ShopLink" next to road near apartment
    const mallGeometry = new THREE.BoxGeometry(20, 10, 15);
    const mallMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const mall = new THREE.Mesh(mallGeometry, mallMaterial);
    mall.position.set(15, 5, 0);
    scene.add(mall);

    // Mall neon sign with flickering effect
    const neonSignGeometry = new THREE.PlaneGeometry(12, 3);
    const neonSignMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff });
    const neonSign = new THREE.Mesh(neonSignGeometry, neonSignMaterial);
    neonSign.position.set(15, 9, 7.6);
    scene.add(neonSign);

    // Text on neon sign using canvas texture
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
