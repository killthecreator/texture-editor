import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  Slider,
  Button,
} from "./../components/ui";

import shirt from "./../assets/man_shirt/man_shirt_preview.png";
import scarf from "./../assets/silk_scarf/silk_scarf_preview.png";

import { Maximize, Sun, Layers, Palette, RefreshCw } from "lucide-react";
import { RootState } from "./../redux/store";
import { useDispatch, useSelector } from "react-redux";

import {
  setCurPiece,
  setScale,
  setRotation,
  setHue,
  setSaturation,
  setLightness,
  setShadow,
  setHighlight,
} from "./../redux/canvasSlice";

function degToRad(degrees: number) {
  return degrees * (Math.PI / 180);
}

const Interface = () => {
  const dispatch = useDispatch();

  const {
    patternScale,
    patternHue,
    patternSaturation,
    patternLightness,
    patternShadow,
    patternHighlight,
  } = useSelector((state: RootState) => state.canvas);

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
                  value={0}
                  onClick={(e) =>
                    dispatch(setRotation(degToRad(+e.currentTarget.value)))
                  }
                >
                  0°
                </Button>
              </li>
              <li>
                <Button
                  value={90}
                  onClick={(e) =>
                    dispatch(setRotation(degToRad(+e.currentTarget.value)))
                  }
                >
                  90°
                </Button>
              </li>
              <li>
                <Button
                  value={-90}
                  onClick={(e) =>
                    dispatch(setRotation(degToRad(+e.currentTarget.value)))
                  }
                >
                  -90°
                </Button>
              </li>

              <li>
                <Button
                  value={180}
                  onClick={(e) =>
                    dispatch(setRotation(degToRad(+e.currentTarget.value)))
                  }
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
              defaultValue={[patternHue]}
              min={-180}
              max={180}
              step={10}
              className="w-96 h-10"
              onValueChange={(value) => dispatch(setHue(value[0]))}
            />
            <p>Saturation</p>
            <Slider
              defaultValue={[patternSaturation]}
              min={0}
              max={2}
              step={0.1}
              className="w-96 h-10"
              onValueChange={(value) => dispatch(setSaturation(value[0]))}
            />
            <p>Lightness</p>
            <Slider
              defaultValue={[patternLightness]}
              min={0.5}
              max={1.5}
              step={0.1}
              className="w-96 h-10"
              onValueChange={(value) => dispatch(setLightness(value[0]))}
            />
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <Sun />
          </NavigationMenuTrigger>
          <NavigationMenuContent className="p-6">
            <p>Shadow</p>
            <Slider
              defaultValue={[patternShadow]}
              min={0}
              max={0.7}
              step={0.01}
              className="w-96 h-10"
              onValueChange={(value) => dispatch(setShadow(value[0]))}
            />
            <p>Highlight</p>
            <Slider
              defaultValue={[patternHighlight]}
              min={0}
              max={1}
              step={0.01}
              className="w-96 h-10"
              onValueChange={(value) => dispatch(setHighlight(value[0]))}
            />
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default Interface;
