import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  Slider,
  Button,
} from "./../components/ui";
import shirt from "./../assets/man_shirt/man_shirt_preview.png";
import scarf from "./../assets/silk_scarf/silk_scarf_preview.png";

import { Maximize, Sun, Layers, Palette, RefreshCw } from "lucide-react";
import { useState } from "react";

import { useAppDispatch, useAppSelector } from "./../hooks/redux";

import {
  setCurPiece,
  setScale,
  setRotation,
  setHue,
  setSaturation,
  setLightness,
  setShadow,
  setHighlight,
  resetColors,
  resetLights,
  resetScale,
} from "./../redux/canvasSlice";

const rotations = [
  { id: 1, val: 0 },
  { id: 2, val: 90 },
  { id: 3, val: -90 },
  { id: 4, val: 180 },
];

const patterns = [
  { id: 1, val: "man_shirt", src: shirt },
  { id: 2, val: "silk_scarf", src: scarf },
];

const Interface = () => {
  const dispatch = useAppDispatch();

  const {
    patternScale,
    patternHue,
    patternSaturation,
    patternLightness,
    patternShadow,
    patternHighlight,
  } = useAppSelector((state) => state.canvas);

  const [actveScale, setActiveScale] = useState("0");

  const scaleItems = rotations.map(({ id, val }) => (
    <li key={id}>
      <Button
        variant={actveScale === `${val}` ? "default" : "secondary"}
        className="w-full"
        value={val}
        onClick={(e) => {
          dispatch(setRotation(+e.currentTarget.value));
          setActiveScale(e.currentTarget.value);
        }}
      >
        {`${val}°`}
      </Button>
    </li>
  ));

  const patternItems = patterns.map(({ id, val, src }) => (
    <li key={id} className="cursor-pointer hover:scale-105">
      <button
        value={val}
        onClick={(e) => dispatch(setCurPiece(e.currentTarget.value))}
      >
        <img src={src} alt={val} />
      </button>
    </li>
  ));

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <Layers />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid grid-cols-2 gap-3 p-6 md:w-[400px]">
              {patternItems}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <Maximize />
          </NavigationMenuTrigger>
          <NavigationMenuContent className="p-6">
            <p>Scale</p>
            <Slider
              value={[patternScale]}
              min={0.5}
              max={1.5}
              step={0.01}
              className="w-96 h-10"
              onValueChange={(value) => dispatch(setScale(value[0]))}
            />
            <Button onClick={() => dispatch(resetScale())}>Reset</Button>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <RefreshCw />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid grid-cols-4 gap-3 p-6 md:w-[400px]">
              {scaleItems}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <Palette />
          </NavigationMenuTrigger>
          <NavigationMenuContent className="p-6">
            <p>Hue</p>
            <Slider
              value={[patternHue]}
              min={-180}
              max={180}
              step={10}
              className="w-96 h-10 "
              onValueChange={(value) => dispatch(setHue(value[0]))}
            />
            <p>Saturation</p>
            <Slider
              value={[patternSaturation]}
              min={0}
              max={2}
              step={0.1}
              className="w-96 h-10"
              onValueChange={(value) => dispatch(setSaturation(value[0]))}
            />
            <p>Lightness</p>
            <Slider
              value={[patternLightness]}
              min={0.5}
              max={1.5}
              step={0.1}
              className="w-96 h-10"
              onValueChange={(value) => dispatch(setLightness(value[0]))}
            />
            <Button onClick={() => dispatch(resetColors())}>Reset</Button>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <Sun />
          </NavigationMenuTrigger>
          <NavigationMenuContent className="p-6">
            <p>Shadow</p>
            <Slider
              value={[patternShadow]}
              min={0}
              max={0.7}
              step={0.01}
              className="w-96 h-10"
              onValueChange={(value) => dispatch(setShadow(value[0]))}
            />
            <p>Highlight</p>
            <Slider
              value={[patternHighlight]}
              min={0}
              max={1}
              step={0.01}
              className="w-96 h-10"
              onValueChange={(value) => dispatch(setHighlight(value[0]))}
            />
            <Button onClick={() => dispatch(resetLights())}>Reset</Button>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default Interface;
