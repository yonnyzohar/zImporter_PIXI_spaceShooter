import * as PIXI from 'pixi.js';
import { Model, StarObj } from '../Model';
import { ZScene } from 'zimporter-pixi/dist/ZScene';
import { ZState } from 'zimporter-pixi';

interface Star {
    x: number;
    y: number;
    rnd: number;
    gfx: ZState;
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

        let allStates: (string | null)[] = [];

        for (let i = 0; i < this.numStars; i++) {
            const x = Math.random() * dimensions.width;
            const y = Math.random() * dimensions.height;
            const rnd = Math.random();
            const star: ZState = scene?.spawn("StarTemplate") as ZState;
            if (i === 0) {
                allStates = star.getAllStateNames();
            }
            const randomState = allStates ? allStates[Math.floor(Math.random() * allStates.length)] : null;
            if (randomState) {
                star.setState(randomState);
            }

            star.x = x;
            star.y = y;
            star.scale.set(rnd);
            this.container.addChild(star);

            this.starsArr.push({ x, y, rnd, gfx: star });
        }
    }

    update(dt: number) {
        let scene: ZScene = ZScene.getSceneById("game-scene")!;
        let dimensions = scene.getInnerDimensions();
        for (let i = 0; i < this.numStars; i++) {
            const star = this.starsArr[i];
            star.y += (this.speed * star.rnd) * dt;

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