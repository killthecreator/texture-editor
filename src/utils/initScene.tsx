import * as THREE from "three";

import store from "./../redux/store";
import { setOffsetX, setOffsetY } from "./../redux/canvasSlice";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const initScene = (canvas: HTMLCanvasElement) => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(25, 1 / 1);

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function checkTarget(event: MouseEvent) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children);
    const isObj = intersects.find(
      (intersect) => intersect.object.userData.name === "object"
    );
    if (isObj) {
      window.addEventListener("mousemove", movePattern);
      window.addEventListener("mouseup", () => {
        window.removeEventListener("mousemove", movePattern);
      });
    }
  }

  function movePattern(event: MouseEvent) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    store.dispatch(setOffsetX(-mouse.x));
    store.dispatch(setOffsetY(-mouse.y));
  }
  window.addEventListener("mousedown", checkTarget, false);

  camera.position.z = 100;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const controls = new OrbitControls(camera, renderer.domElement);
  const animate = () => {
    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
  };

  animate();

  return scene;
};

export default initScene;