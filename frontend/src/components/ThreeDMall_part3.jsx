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
    mountRef.current.removeChild(button);
    mountRef.current.removeChild(renderer.domElement);
    controls.dispose();
  };
}
