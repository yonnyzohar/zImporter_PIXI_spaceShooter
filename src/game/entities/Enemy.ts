


import { ZScene } from "zimporter-pixi";
import { Entity } from "../../core/Entity";
import { Pool } from "../../core/Pool";
import { Updatables } from "../../core/Updatables";
import { EntityObj, Model } from "../Model";
import { EventsManager } from "../../core/EventsManager";

export class Enemy extends Entity {
    pool: Pool<Entity>;
    initialXOffset: number = 0;
    private fireRate: number;
    private speed: number;
    radius: number;

    constructor(params: EntityObj) {
        super(params);

        console.log("Enemy init!");
        this.pool = params.pool!;
        let scene: ZScene = ZScene.getSceneById("game-scene")!;
        this.asset = scene?.spawn(params.assetName);
        this.asset!.pivotX = this.asset!.width / 2;
        this.asset!.pivotY = this.asset!.height / 2;
        this.fireRate = params.cannonObj?.fireRate || 0;
        this.speed = params.speed!;
        this.w = this.asset!.width;
        this.h = this.asset!.height;
        this.radius = Math.min(this.w!, this.h!) / 2;
    }

    spawn(_x: number, _y: number) {
        this.x = _x;
        this.y = _y;
        this.initialXOffset = Math.random() * 6.24;
        Updatables.add(this);
        Model.stage?.addChild(this.asset!);
    }

    update(dt: number) {
        let scene: ZScene = ZScene.getSceneById("game-scene")!;
        let dimensions = scene.getInnerDimensions();
        super.update(dt);
        this.x! += Math.cos(performance.now() / 1000 + this.initialXOffset) * 50 * dt;
        this.y! += this.speed * dt;
        const newX = this.x!;
        const newY = this.y!;
        this.asset!.x = newX;
        this.asset!.y = newY;

        if (this.y! > dimensions.height) {
            this.destroyEntity();
        }
        this.fixBounds();
    }

    fixBounds() {
        let scene: ZScene = ZScene.getSceneById("game-scene")!;
        let dimensions = scene.getInnerDimensions();
        if ((this.x! + this.w! / 2) > dimensions.width) {
            this.x = dimensions.width - this.w! / 2;
        }
        if ((this.x! - this.w! / 2) < 0) {
            this.x = this.w! / 2;
        }

    }

    destroyEntity() {
        this.asset?.removeFromParent();
        EventsManager.emit('ENEMY_DESTROYED', { x: this.x!, y: this.y! });
        this.pool.putBack(this);
        Updatables.remove(this);
        super.destroyEntity();

    }


}