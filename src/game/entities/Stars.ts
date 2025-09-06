import * as PIXI from 'pixi.js';
import { Model, StarObj } from '../Model';
import { ZScene } from 'zimporter-pixi/dist/ZScene';

interface Star {
    x: number;
    y: number;
    rnd: number;
    gfx: PIXI.Graphics;
}



export class Stars {
    private speed: number;
    private radius: number;
    private numStars: number;
    private starsArr: Star[] = [];
    private container: PIXI.Container;

    constructor(params: StarObj, parent: PIXI.Container) {
        let scene: ZScene = ZScene.getSceneById("game-scene")!;
        let dimensions = scene.getInnerDimensions();
        this.speed = params.speed;
        this.radius = params.radius;
        this.numStars = params.numStars;
        this.container = parent;

        for (let i = 0; i < this.numStars; i++) {
            const x = Math.random() * dimensions.width;
            const y = Math.random() * dimensions.height;
            const rnd = Math.random() * 1.5;
            const gfx = new PIXI.Graphics();
            gfx.beginFill(0xffffff);
            gfx.drawCircle(0, 0, this.radius + rnd);
            gfx.endFill();
            gfx.x = x;
            gfx.y = y;
            this.container.addChild(gfx);

            this.starsArr.push({ x, y, rnd, gfx });
        }
    }

    update(dt: number) {
        let scene: ZScene = ZScene.getSceneById("game-scene")!;
        let dimensions = scene.getInnerDimensions();
        for (let i = 0; i < this.numStars; i++) {
            const star = this.starsArr[i];
            star.y += (this.speed + (star.rnd * 20)) * dt;

            if (star.y > dimensions.height) {
                star.y = star.y - dimensions.height;
                star.x = Math.random() * dimensions.width;
            }

            star.gfx.x = star.x;
            star.gfx.y = star.y;
        }
    }

    // No draw() needed; PIXI handles rendering automatically
}