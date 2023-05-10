import { useEffect, useRef, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "./redux/store";
import { cn } from "./lib/utils";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import Interface from "./components/Interface";
import initScene from "./utils/initScene";
import { SpinnerDiamond } from "spinners-react";

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

  const manager = useMemo(() => new THREE.LoadingManager(), []);

  const textureLoader = useMemo(
    () => new THREE.TextureLoader(manager),
    [manager]
  );

  const alphaTexture = useMemo(() => {
    const alphaTexture = textureLoader.load(
      `src/assets/${curPiece}/${curPiece}_overlay.png`
    );
    alphaTexture.encoding = THREE.sRGBEncoding;
    return alphaTexture;
  }, [curPiece, textureLoader]);

  const lightTexture = useMemo(() => {
    const lightTexture = textureLoader.load(
      `src/assets/${curPiece}/${curPiece}_light.png`
    );
    lightTexture.encoding = THREE.sRGBEncoding;
    return lightTexture;
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

  const plane = useMemo(() => new THREE.PlaneGeometry(50, 50, 50), []);
  const lightMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        transparent: true,
        lightMap: lightTexture,
        blending: THREE.CustomBlending,
        blendEquation: THREE.AddEquation,
        blendSrc: THREE.SrcAlphaSaturateFactor,
        blendDst: THREE.OneMinusSrcColorFactor,
      }),
    [lightTexture]
  );

  const lightPlane = useMemo(() => {
    const lightPlane = new THREE.Mesh(plane, lightMaterial);
    lightPlane.position.z = 0.01;
    return lightPlane;
  }, [plane, lightMaterial]);

  const alphaMaterial = new THREE.MeshBasicMaterial({
    transparent: true,
    alphaMap: alphaTexture,
    blending: THREE.CustomBlending,
    blendEquation: THREE.ReverseSubtractEquation,
    blendSrc: THREE.OneMinusDstAlphaFactor,
    blendDst: THREE.SrcAlphaFactor,
  });
  const alphaPlane = new THREE.Mesh(plane, alphaMaterial);

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
    ambLight.intensity = patternLightness - patternShadow * 0.75;
  }, [patternLightness, ambLight, patternShadow]);

  useEffect(() => {
    if (canvasRef.current && bgImageRef.current) {
      setIsCanvasLoading(true);
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
