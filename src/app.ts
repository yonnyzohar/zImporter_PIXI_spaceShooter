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
  positionPreloader();
});



(globalThis as any).__PIXI_APP__ = app;

// ── Preloader ──────────────────────────────────────────────────────────────
const preloaderContainer = new PIXI.Container();

const preloaderBg = new PIXI.Graphics();
preloaderBg.beginFill(0x000000);
preloaderBg.drawRect(0, 0, window.innerWidth, window.innerHeight);
preloaderBg.endFill();
preloaderContainer.addChild(preloaderBg);

const BAR_W = 300;
const BAR_H = 20;
const barBg = new PIXI.Graphics();
barBg.beginFill(0x333333);
barBg.drawRoundedRect(0, 0, BAR_W, BAR_H, BAR_H / 2);
barBg.endFill();

const barFill = new PIXI.Graphics();

const loadingLabel = new PIXI.Text('Loading... 0%', {
  fontSize: 20,
  fill: 0xffffff,
  fontFamily: 'Arial'
});

preloaderContainer.addChild(barBg);
preloaderContainer.addChild(barFill);
preloaderContainer.addChild(loadingLabel);

function positionPreloader() {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  preloaderBg.clear();
  preloaderBg.beginFill(0x000000);
  preloaderBg.drawRect(0, 0, window.innerWidth, window.innerHeight);
  preloaderBg.endFill();
  barBg.x = cx - BAR_W / 2;
  barBg.y = cy - BAR_H / 2;
  barFill.x = barBg.x;
  barFill.y = barBg.y;
  loadingLabel.x = cx - loadingLabel.width / 2;
  loadingLabel.y = cy - BAR_H / 2 - 36;
}
positionPreloader();

app.stage.addChild(preloaderContainer);

function updatePreloader(per: number) {
  const pct = Math.floor(per * 100);
  loadingLabel.text = `Loading... ${pct}%`;
  loadingLabel.x = window.innerWidth / 2 - loadingLabel.width / 2;
  barFill.clear();
  barFill.beginFill(0x4488ff);
  barFill.drawRoundedRect(0, 0, BAR_W * per, BAR_H, BAR_H / 2);
  barFill.endFill();
}

function hidePreloader() {
  app.stage.removeChild(preloaderContainer);
}
// ───────────────────────────────────────────────────────────────────────────

var main = new Main(app.stage, resizeCanvas, updatePreloader, hidePreloader);


// Append the app's view to the DOM
document.body.appendChild(app.view as any);
ZUpdatables.init(targetFPS);

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
    //fpsText.text = `FPS: ${targetFPS}`;
    //fpsText.parent?.addChild(fpsText);
    frameCount = 0;
  }
});


export * from "./game";
export * from "./core";
export * from "./managers";
export * from "./game/entities";
