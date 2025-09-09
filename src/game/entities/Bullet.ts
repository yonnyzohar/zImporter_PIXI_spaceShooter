import { ZScene } from "zimporter-pixi";
import { Entity } from "../../core/Entity";
import { EventsManager } from "../../core/EventsManager";
import { Updatables } from "../../core/Updatables";
import { Utils } from "../../core/Utils";
import { EntityObj, Model } from "../Model";



export class Bullet extends Entity {
    speed: number;
    w: number;
    h: number;

    angle: number = 0;
    x: number = 0;
    y: number = 0;

    constructor(params: EntityObj) {
        super(params);
        this.speed = params.speed!;
        let scene = ZScene.getSceneById("game-scene");
        this.asset = scene?.spawn(params.assetName);
        this.pool = params.pool!;
        this.w = this.asset!.width;
        this.h = this.asset!.height;
        this.radius = Math.min(this.w, this.h) / 2;
    }

    fire(_x: number, _y: number, initialAngle: number) {
        this.angle = initialAngle;
        this.x = _x - (this.w / 2);
        this.y = _y;
        Model.stage?.addChild(this.asset!);
        this.asset!.x = this.x;
        this.asset!.y = this.y;
        this.asset!.pivotX = this.asset!.width / 2;
        this.asset!.pivotY = this.asset!.height / 2;
        Updatables.add(this);
    }

    update(dt: number) {
        let scene: ZScene = ZScene.getSceneById("game-scene")!;
        let dimensions = scene.getInnerDimensions();
        const cos = Math.cos(this.angle);
        const sin = Math.sin(this.angle);

        this.x = this.x + (cos * this.speed * dt);
        this.y = this.y + (sin * this.speed * dt);
        const newX = this.x;
        const newY = this.y;
        this.asset!.x = newX;
        this.asset!.y = newY;

        if (this.y < 0 || this.x < 0 || this.x > dimensions.width) {
            this.destroyEntity();
            return;
        }

        const collisions = Utils.getCollisions(this, this.radius!, Model.enemiesGrid, Model.gridSize);

        if (collisions) {
            for (let i = 0; i < collisions.length; i++) {
                let collision = collisions[i];
                collision.destroyEntity();
                this.destroyEntity();
                EventsManager.emit("ENEMY_DESTROYED", { x: collision.x, y: collision.y });
            }

            //if (!this.shield) {
            //    this.shock = true;
            //    this.shockVal = 0;
            //    EventsManager.emit("SHIP_COLISSION", { x: this.x, y: this.y });
            //}
        }


    }

    destroyEntity() {
        this.pool!.putBack(this);
        Updatables.remove(this);
        if (this.asset) {
            Model.stage?.removeChild(this.asset);
        }
    }
}