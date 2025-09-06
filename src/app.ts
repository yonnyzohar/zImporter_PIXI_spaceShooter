import * as PIXI from 'pixi.js';
import { Main } from "./Main";
import { ZSceneStack } from 'zimporter-pixi';
import { ZUpdatables } from 'zimporter-pixi';
//npx webpack

const targetFPS = 24;
const app = new PIXI.Application({

  backgroundColor: 0x000000,
  resolution: window.devicePixelRatio || 1, // Handle high-DPI screens
  autoDensity: true, // Improve sharpness on high-DPI screens
  antialias: true // Smooth rendering
});


function resizeCanvas() {
  app.renderer.resize(window.innerWidth, window.innerHeight);
  ZSceneStack.resize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", () => {
  resizeCanvas();
});



(globalThis as any).__PIXI_APP__ = app;

var main = new Main(app.stage, resizeCanvas);


// Append the app's view to the DOM
document.body.appendChild(app.view as any);
ZUpdatables.init(targetFPS);

const fpsText = new PIXI.Text('FPS: 0', { fontSize: 24, fill: 'white' });
fpsText.position.set(10, 10);
app.stage.addChild(fpsText);

// Update FPS every frame
let lastTime = performance.now();
let frameCount = 0;


const frameDuration = 1000 / targetFPS; // ~41.67ms per frame
let accumulator = 0;

app.ticker.add(() => {
  const now = performance.now();
  const delta = now - lastTime;
  lastTime = now;

  accumulator += delta;

  // Run update at fixed 24 FPS
  while (accumulator >= frameDuration) {
    const deltaSeconds = frameDuration / 1000;
    main.update(deltaSeconds);
    ZUpdatables.update();

    accumulator -= frameDuration;
    frameCount++;
  }

  // Update FPS counter once per second
  if (frameCount >= targetFPS) {
    fpsText.text = `FPS: ${targetFPS}`;
    fpsText.parent?.addChild(fpsText);
    frameCount = 0;
  }
});


export * from "./game";
export * from "./core";
export * from "./managers";
export * from "./game/entities";
