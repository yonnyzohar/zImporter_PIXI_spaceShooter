
import { ZScene } from "zimporter-pixi";
import { Entity } from "../core/Entity";
import { Updatables } from "../core/Updatables";
import { CollectibleObj, Model } from "./Model";


export class Collectible extends Entity {
    speed: number;
    type: string;
    rnd: number;



    constructor(params: CollectibleObj) {
        super(params);
        console.log("Coin init!");
        this.pool = params.pool;
        this.speed = params.speed ?? 50;
        let scene = ZScene.getSceneById("game-scene");
        this.asset = scene?.spawn(params.assetName);
        this.type = params.type;
        this.w = this.asset!.width;
        this.h = this.asset!.height;
        this.rnd = Math.random();
        this.radius = Math.min(this.w, this.h) / 2;
    }

    spawn(_x: number, _y: number) {
        this.x = _x;
        this.y = _y;
        Updatables.add(this);
    }

    update(dt: number) {
        super.update(dt);
        this.x! += Math.cos(performance.now() / 1000 * 2 * this.rnd) * (50 * dt);
        this.y! += this.speed * dt;
        const newX = this.x!;
        const newY = this.y!;
        this.asset!.x = newX;
        this.asset!.y = newY;

        if (this.y! > Model.stageHeight!) {
            this.destroyEntity();
        }
    }

    destroyEntity() {
        super.destroyEntity();
        this.pool!.putBack(this);
        Updatables.remove(this);
    }
}