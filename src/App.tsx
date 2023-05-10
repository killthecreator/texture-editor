import { useEffect, useRef, useState, useMemo } from "react";

import * as THREE from "three";

import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import Interface from "./components/Interface";
import initScene from "./utils/initScene";
import { RootState } from "./redux/store";
import { cn } from "./lib/utils";

import { useSelector } from "react-redux";

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
  } = useSelector((state: RootState) => state.canvas);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgImageRef = useRef<HTMLImageElement>(null);

  const [isCanvasLoading, setIsCanvasLoading] = useState(true);
  const [isImageLoading, setIsImageLoading] = useState(true);

  const manager = useMemo(() => new THREE.LoadingManager(), []);

  const textureLoader = useMemo(
    () => new THREE.TextureLoader(manager),
    [manager]
  );

  const overlay = useMemo(() => {
    const overlay = textureLoader.load(
      `src/assets/${curPiece}/${curPiece}_overlay.png`
    );
    overlay.encoding = THREE.sRGBEncoding;
    return overlay;
  }, [curPiece, textureLoader]);

  const light = useMemo(() => {
    const light = textureLoader.load(
      `src/assets/${curPiece}/${curPiece}_light.png`
    );
    light.encoding = THREE.sRGBEncoding;

    return light;
  }, [curPiece, textureLoader]);

  const pattern = useMemo(() => {
    const pattern = textureLoader.load("src/assets/patterns/1_texture_3d.jpg");
    pattern.encoding = THREE.sRGBEncoding;

    pattern.center.set(0.5, 0.5);
    pattern.wrapS = pattern.wrapT = THREE.RepeatWrapping;
    return pattern;
  }, [textureLoader]);
  pattern.rotation = patternRotation;
  pattern.repeat.set(1 / patternScale, 0.5 / patternScale);
  pattern.offset.x = patternOffsetX;
  pattern.offset.y = patternOffsetY;

  const geometry = useMemo(() => new THREE.PlaneGeometry(50, 50, 50), []);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        transparent: true,
        lightMap: light,
        blending: THREE.CustomBlending,
        blendEquation: THREE.AddEquation,
        blendSrc: THREE.SrcAlphaSaturateFactor,
        blendDst: THREE.OneMinusSrcColorFactor,
      }),
    [light]
  );

  const plane = useMemo(() => {
    const plane = new THREE.Mesh(geometry, material);
    plane.position.z = 0.01;
    return plane;
  }, [geometry, material]);

  const material2 = new THREE.MeshBasicMaterial({
    transparent: true,
    alphaMap: overlay,
    blending: THREE.CustomBlending,
    blendEquation: THREE.ReverseSubtractEquation,
    blendSrc: THREE.OneMinusDstAlphaFactor,
    blendDst: THREE.SrcAlphaFactor,
  });

  const plane2 = new THREE.Mesh(geometry, material2);
  const objLoader = useMemo(() => new OBJLoader(manager), [manager]);

  const shirtMaterial = new THREE.MeshStandardMaterial({
    transparent: true,
    depthWrite: false,
    map: pattern,
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
  const lightShadow = useMemo(() => {
    const lightShadow = new THREE.SpotLight(0xffffff);
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
    return lightShadow;
  }, [lightShadowTarget]);

  const sphereGeometry = new THREE.SphereGeometry(10, 32, 32);
  const sphereMaterial = new THREE.MeshStandardMaterial({
    transparent: true,
    opacity: 0,
  });
  const sphereShadow = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphereShadow.position.x = 8;
  sphereShadow.position.y = -10;
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
    ambLight.intensity = patternLightness - patternShadow / 2;
  }, [patternLightness, ambLight, patternShadow]);

  useEffect(() => {
    if (canvasRef.current && bgImageRef.current) {
      bgImageRef.current.src = `src/assets/${curPiece}/${curPiece}_front.png `;
      const scene = initScene(canvasRef.current);
      objLoader.load(
        `src/assets/${curPiece}/${curPiece}_3d_model.obj`,
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
            scene.add(
              plane,
              plane2,
              ambLight,
              spotlight,
              spotlightShadowTarget,
              sphereShadow,
              lightShadow,
              lightShadowTarget,
              object
            );
          };
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }, [curPiece]);

  return (
    <div className="flex flex-col items-center">
      <Interface />

      <>
        <canvas
          style={{
            filter: `hue-rotate(${patternHue}deg) saturate(${patternSaturation}) `,
          }}
          className={cn("mt-5 w-[90vh] aspect-square sm:h-auto")}
          ref={canvasRef}
        />

        <div
          id="image-cont"
          className="absolute z-[2] aspect-square  mt-[60px] w-[90vh] sm:h-auto pointer-events-none"
        >
          <img
            ref={bgImageRef}
            alt="pattern"
            className={cn("pointer-events-none")}
            onLoad={() => setIsImageLoading(false)}
          />
        </div>
      </>
    </div>
  );
}

export default App;
