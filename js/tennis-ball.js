const canvas = document.querySelector("#tennis-ball");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (canvas) {
  try {
    const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js");
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.z = 4.8;
    const texture = await new THREE.TextureLoader().loadAsync("./image/beach-tennis-ball-cutout.png");
    texture.colorSpace = THREE.SRGBColorSpace;
    const ball = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 3.6),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide, depthWrite: false }),
    );
    scene.add(ball);
    canvas.closest(".hero-orbit").classList.add("is-rendering");

    const resize = () => {
      const size = canvas.getBoundingClientRect().width;
      if (!size) return;
      renderer.setSize(size, size, false);
      camera.aspect = 1;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
    new ResizeObserver(resize).observe(canvas);
    resize();

    let visible = true;
    let frame = 0;
    let lastTime = 0;
    const tick = (time) => {
      if (visible && !document.hidden && !reducedMotion.matches) {
        const delta = Math.min((time - lastTime) / 1000, 0.05);
        ball.rotation.y = Math.sin(time * 0.00055) * 0.13;
        ball.rotation.x = Math.sin(time * 0.0004) * 0.07;
        ball.position.y = Math.sin(time * 0.0012) * 0.06;
        renderer.render(scene, camera);
        lastTime = time;
        frame = requestAnimationFrame(tick);
      } else {
        frame = 0;
      }
    };
    const sync = () => {
      if (visible && !document.hidden && !reducedMotion.matches && !frame) {
        lastTime = performance.now();
        frame = requestAnimationFrame(tick);
      } else if ((!visible || document.hidden || reducedMotion.matches) && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
      renderer.render(scene, camera);
    };
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }).observe(canvas);
    document.addEventListener("visibilitychange", sync);
    reducedMotion.addEventListener("change", sync);
    sync();
  } catch (error) {
    canvas.hidden = true;
    console.warn("Three.js unavailable; hero artwork remains usable.", error);
  }
}
