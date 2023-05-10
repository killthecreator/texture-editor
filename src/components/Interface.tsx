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
import { cn } from "./../lib/utils";

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

function degToRad(degrees: number) {
  return degrees * (Math.PI / 180);
}

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

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <Layers />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid grid-cols-2 gap-3 p-6 md:w-[400px]">
              <div className="cursor-pointer hover:scale-105">
                <button
                  value="man_shirt"
                  onClick={(e) => dispatch(setCurPiece(e.currentTarget.value))}
                >
                  <img src={shirt} alt="man_shirt" />
                </button>
              </div>
              <div className="cursor-pointer hover:scale-105">
                <button
                  value="silk_scarf"
                  onClick={(e) => dispatch(setCurPiece(e.currentTarget.value))}
                >
                  <img src={scarf} alt="silk_scarf" />
                </button>
              </div>
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
              defaultValue={[patternScale]}
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
              <li>
                <Button
                  variant={actveScale === "0" ? "default" : "secondary"}
                  className="w-full"
                  value={0}
                  onClick={(e) => {
                    dispatch(setRotation(degToRad(+e.currentTarget.value)));
                    setActiveScale(e.currentTarget.value);
                  }}
                >
                  0°
                </Button>
              </li>
              <li>
                <Button
                  variant={actveScale === "90" ? "default" : "secondary"}
                  className="w-full"
                  value={90}
                  onClick={(e) => {
                    dispatch(setRotation(degToRad(+e.currentTarget.value)));
                    setActiveScale(e.currentTarget.value);
                  }}
                >
                  90°
                </Button>
              </li>
              <li>
                <Button
                  variant={actveScale === "-90" ? "default" : "secondary"}
                  className="w-full"
                  value={-90}
                  onClick={(e) => {
                    dispatch(setRotation(degToRad(+e.currentTarget.value)));
                    setActiveScale(e.currentTarget.value);
                  }}
                >
                  -90°
                </Button>
              </li>

              <li>
                <Button
                  variant={actveScale === "180" ? "default" : "secondary"}
                  className="w-full"
                  value={180}
                  onClick={(e) => {
                    dispatch(setRotation(degToRad(+e.currentTarget.value)));
                    setActiveScale(e.currentTarget.value);
                  }}
                >
                  180°
                </Button>
              </li>
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
