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
}
