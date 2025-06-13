# Audio-Driven Interactive Prototype

## Technical Explanation

### 1. Packaging of the Source Code  
The project is organized into modular functions:
- `drawPolygon()` – Base polygons  
- `drawSplitCirclePrecise()` – Red-green split circles  
- `drawTopArch()` – Bottom arches  
- `drawPath()` / `drawCircles()` – Tree lines and shadows  
- `preload()` and `draw()` – Load and render background image

### 2. Additional Sound Recognition Features

#### Rain Intensity & Background Visibility  
- Sound above threshold → `revealAmount` increases → dark overlay & rain appears  
- Rain streaks and bottom splashes animate  
- Sound fades → rainstorm layer disappears

#### Tree Branch Movement  
- Microphone level → mapped to oscillation  
- `rotate(sin())` used to animate tree branches left–right  
- `push()`/`pop()` isolate movement of each side

---

## Code Notes

### 1. External references:
- p5.js sound: https://p5js.org/reference/#/libraries/p5.sound  
- lerp()easing: https://p5js.org/reference/#/p5/lerp  
- Rain effect:  
  https://editor.p5js.org/Skylarkroam/sketches/B1U0PVnC7  
  https://editor.p5js.org/xinxin/sketches/UXtL6HDSi  
- Branch motion:  
  https://editor.p5js.org/pasquini/sketches/cg0h5BAWu

### 2. AI Appendix:
I used AI to help check and explain this code.  
ChatGPT (accessed on May 25, 2025). https://chat.openai.com
