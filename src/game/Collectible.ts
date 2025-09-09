
import { ZScene } from "zimporter-pixi";
import { Entity } from "../core/Entity";
import { Updatables } from "../core/Updatables";
import { CollectibleObj, Model } from "./Model";


export class Collectible extends Entity {
    speed: number;
    rnd: number;
    time: number;
    currTime: number = 0;


    constructor(params: CollectibleObj) {
        super(params);

        this.pool = params.pool;
        this.speed = params.speed ?? 50;

        this.rnd = Math.random();

        this.time = params.time;

    }



    spawn(_x: number, _y: number) {
        this.x = _x;
        this.y = _y;
        Model.stage?.addChild(this.asset!);
        Updatables.add(this);
        this.currTime = 0;
        this.asset!.alpha = 1;

    }

    update(dt: number) {
        let scene: ZScene = ZScene.getSceneById("game-scene")!;
        let dimensions = scene.getInnerDimensions();
        super.update(dt);
        this.x! += Math.cos(performance.now() / 1000 * 2 * this.rnd) * (50 * dt);
        this.y! += this.speed * dt;
        const newX = this.x!;
        const newY = this.y!;
        this.asset!.x = newX;
        this.asset!.y = newY;
        this.currTime += (dt * 1000);

        if (this.y! > dimensions.height || this.currTime > this.time) {
            this.asset!.alpha -= 0.02;
            if (this.asset!.alpha <= 0) {
                this.asset!.alpha = 0;
                this.destroyEntity();
            }

        }
    }

    destroyEntity() {
        this.asset?.removeFromParent();
        super.destroyEntity();
        this.pool!.putBack(this);
        Updatables.remove(this);
    }
}