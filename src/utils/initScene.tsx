import * as THREE from "three";
import store from "./../redux/store";
import { setOffsetX, setOffsetY } from "./../redux/canvasSlice";

const initScene = (canvas: HTMLCanvasElement) => {
  const scene = new THREE.Scene();

  /* 'I have front layer (the one with actual image of a guy/hanger) separated from 
  canvas with three js. it was made to have ability to change hue of the pattern. 
  I couldn't find another way to dinamically change it with three js. it has setHSL 
  function, it didn't work as i needed, so had to make a workaround like this. 
  So i made two separate layers - one with front image as img tag 
  and another one with a canvas. they have the same size and made one 
  on top of another with css. So basically they should have been ideally 
  matched, but somehow it didn't happen. To fix that i changed a three 
  js scene camera parametres a little and sizes of three js planes that 
  i used for layers so they finally matched together' */

  /* Initial camera configuration was (25, 1 / 1). For plane configuration check App.tsx file */
  const camera = new THREE.PerspectiveCamera(25.9, 1 / 1);

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
    const curRotation = store.getState().canvas.patternRotation;

    switch (curRotation) {
      case 0:
        store.dispatch(setOffsetX(-mouse.x));
        store.dispatch(setOffsetY(-mouse.y));
        break;
      case 90:
        store.dispatch(setOffsetX(-mouse.y));
        store.dispatch(setOffsetY(mouse.x));
        break;
      case -90:
        store.dispatch(setOffsetX(mouse.y));
        store.dispatch(setOffsetY(-mouse.x));
        break;
      case 180:
        store.dispatch(setOffsetX(mouse.x));
        store.dispatch(setOffsetY(mouse.y));
        break;
    }
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

  const animate = () => {
    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
  };

  animate();

  return scene;
};

export default initScene;
