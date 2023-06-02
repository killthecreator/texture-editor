import { useEffect, useRef, useState, useMemo } from "react";

import { cn } from "./lib/utils";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import Interface from "./components/Interface";
import initScene from "./utils/initScene";
import { SpinnerDiamond } from "spinners-react";
import { useAppSelector } from "./hooks/redux";

function degToRad(degrees: number) {
  return degrees * (Math.PI / 180);
}

function App() {
  const {
    curPiece,
    patternOffsetX,
    patternOffsetY,
    patternScale,
    patternRotation,
    patternHue,
    patternSaturation,
    patternLightness,
    patternShadow,
    patternHighlight,
  } = useAppSelector((state) => state.canvas);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgImageRef = useRef<HTMLImageElement>(null);

  const [isCanvasLoading, setIsCanvasLoading] = useState(true);

  const manager = useMemo(() => new THREE.LoadingManager(), []);

  const textureLoader = useMemo(
    () => new THREE.TextureLoader(manager),
    [manager]
  );

  const alphaTexture = useMemo(() => {
    const alphaTexture = textureLoader.load(
      new URL(`./assets/${curPiece}/${curPiece}_overlay.png`, import.meta.url)
        .href
    );
    alphaTexture.encoding = THREE.sRGBEncoding;
    return alphaTexture;
  }, [curPiece, textureLoader]);

  const lightTexture = useMemo(() => {
    const lightTexture = textureLoader.load(
      new URL(`./assets/${curPiece}/${curPiece}_light.png`, import.meta.url)
        .href
    );
    lightTexture.encoding = THREE.sRGBEncoding;
    return lightTexture;
  }, [curPiece, textureLoader]);

  const pattern = useMemo(() => {
    const pattern = textureLoader.load(
      new URL("./assets/patterns/1_texture_3d.jpg", import.meta.url).href
    );
    pattern.encoding = THREE.sRGBEncoding;
    pattern.center.set(0.5, 0.5);
    pattern.wrapS = pattern.wrapT = THREE.RepeatWrapping;
    return pattern;
  }, [textureLoader]);
  pattern.rotation = degToRad(patternRotation);
  pattern.repeat.set(1 / patternScale, 0.5 / patternScale);
  pattern.offset.x = patternOffsetX;
  pattern.offset.y = patternOffsetY;

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

  /* Initial plane configuration was (50, 50, 50). For camera configuration check initScene.tsx file */
  const plane = useMemo(() => new THREE.PlaneGeometry(45, 45, 50), []);
  const lightMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        transparent: true,
        lightMap: lightTexture,
        depthWrite: false,
        blending: THREE.CustomBlending,
        blendEquation: THREE.AddEquation,
        blendSrc: THREE.SrcAlphaSaturateFactor,
        blendDst: THREE.OneMinusSrcColorFactor,
      }),
    [lightTexture]
  );

  const lightPlane = useMemo(() => {
    const lightPlane = new THREE.Mesh(plane, lightMaterial);
    lightPlane.position.z = 3;
    return lightPlane;
  }, [plane, lightMaterial]);

  const alphaMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        transparent: true,
        alphaMap: alphaTexture,
        blending: THREE.CustomBlending,
        blendEquation: THREE.ReverseSubtractEquation,
        blendSrc: THREE.OneMinusDstAlphaFactor,
        blendDst: THREE.SrcAlphaFactor,
      }),

    [alphaTexture]
  );
  const alphaPlane = useMemo(() => {
    const alphaPlane = new THREE.Mesh(plane, alphaMaterial);
    alphaPlane.position.z = 2;
    return alphaPlane;
  }, [plane, alphaMaterial]);

  const objLoader = useMemo(() => new OBJLoader(manager), [manager]);
  const shirtMaterial = new THREE.MeshStandardMaterial({
    transparent: true,
    map: pattern,
    depthTest: true,
  });

  const ambLight = useMemo(() => {
    const ambLight = new THREE.AmbientLight(0xffffff);
    return ambLight;
  }, []);

  const spotlightShadowTarget = useMemo(() => new THREE.Object3D(), []);
  const spotlight = useMemo(() => {
    const spotlight = new THREE.SpotLight(0xffffff);
    spotlight.position.set(-25, 15, 15);
    spotlight.angle = Math.PI / 9;
    spotlight.decay = 1;
    spotlight.penumbra = 0.5;
    spotlight.castShadow = true;
    spotlight.target = spotlightShadowTarget;
    spotlight.target.position.x = -5;
    spotlight.target.position.y = 5;
    return spotlight;
  }, [spotlightShadowTarget]);

  const lightShadowTarget = useMemo(() => new THREE.Object3D(), []);
  const lightShadow = useMemo(() => new THREE.SpotLight(0xffffff), []);
  lightShadow.position.set(0, -10, 25);
  lightShadow.angle = Math.PI / 3;
  lightShadow.castShadow = true;
  lightShadow.shadow.mapSize.width = 64;
  lightShadow.shadow.mapSize.height = 64;
  lightShadow.shadow.camera.near = 8;
  lightShadow.shadow.camera.far = 50;
  lightShadow.target = lightShadowTarget;
  lightShadow.target.position.x = 10;
  lightShadow.target.position.y = 5;

  const sphereGeometry = useMemo(() => new THREE.SphereGeometry(8, 32, 32), []);
  const sphereMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        transparent: true,
        opacity: 0,
      }),
    []
  );
  const sphereShadow = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphereShadow.position.x = 6.5;
  sphereShadow.position.y = -9;
  sphereShadow.position.z = 10;
  sphereShadow.castShadow = true;
  sphereShadow.receiveShadow = false;

  useEffect(() => {
    spotlight.intensity = patternHighlight;
  }, [spotlight, patternHighlight]);
  useEffect(() => {
    lightShadow.intensity = patternShadow;
  }, [lightShadow, patternShadow, patternLightness]);

  useEffect(() => {
    ambLight.intensity = patternLightness - patternShadow * 0.65;
  }, [patternLightness, ambLight, patternShadow]);

  useEffect(() => {
    if (canvasRef.current && bgImageRef.current) {
      setIsCanvasLoading(true);
      bgImageRef.current.src = new URL(
        `./assets/${curPiece}/${curPiece}_front.png`,
        import.meta.url
      ).href;
      const scene = initScene(canvasRef.current);
      objLoader.load(
        new URL(
          `./assets/${curPiece}/${curPiece}_3d_model.obj`,
          import.meta.url
        ).href,
        (object) => {
          object.scale.set(patternScale + 24, patternScale + 24, 1);
          object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.userData.name = "object";
              child.material = shirtMaterial;
              child.renderOrder = -Infinity;
              child.receiveShadow = true;
              child.castShadow = false;
            }
          });

          manager.onLoad = () => {
            setIsCanvasLoading(false);
            scene.add(
              lightPlane,
              alphaPlane,
              ambLight,
              spotlight,
              spotlightShadowTarget,
              sphereShadow,
              lightShadow,
              lightShadowTarget,
              object
            );
          };
        }
      );
    }
  }, [curPiece]);

  return (
    <div className="flex flex-col items-center">
      <Interface />
      {isCanvasLoading && (
        <SpinnerDiamond
          color="#000"
          className="fixed text-2xl font-bold top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2d"
        />
      )}

      <canvas
        style={{
          filter: `hue-rotate(${patternHue}deg) saturate(${patternSaturation}) `,
        }}
        className={cn(
          "mt-5 w-[90vh] aspect-square sm:h-auto",
          isCanvasLoading && "opacity-0"
        )}
        ref={canvasRef}
      />
      <div className="absolute z-[2] aspect-square  mt-[60px] w-[90vh] sm:h-auto pointer-events-none">
        <img
          ref={bgImageRef}
          alt="pattern"
          className={cn("pointer-events-none", isCanvasLoading && "opacity-0")}
        />
      </div>
    </div>
  );
}

export default App;
