


import { ZScene } from "zimporter-pixi";
import { Entity } from "../../core/Entity";
import { Pool } from "../../core/Pool";
import { Updatables } from "../../core/Updatables";
import { EnemyObj, EntityObj, Model, WeaponObj } from "../Model";
import { EventsManager } from "../../core/EventsManager";
import { Cannon } from "./Cannon";
import { Utils } from "../../core/Utils";

export class Enemy extends Entity {
    pool: Pool<Entity>;
    initialXOffset: number = 0;
    private fireRate: number;
    private speed: number;
    radius: number;
    public static globalId = 0;
    private ship: Entity | null = null;
    cannon: Cannon | null = null;
    private fireRadius: number = 0;

    constructor(params: EnemyObj) {
        super(params);

        this.pool = params.pool!;

        this.speed = params.speed!;

        if (params.cannonName) {
            params.cannonObj = Model.weapons[params.cannonName];
            this.fireRate = params.cannonObj?.fireRate || 0;
            this.fireRadius = params?.cannonObj.fireRadius || 0;
            this.setCannon(params.cannonObj);
        }
    }

    public setShip(ship: Entity | null) {
        this.ship = ship;
    }

    spawn(_x: number, _y: number) {
        this.x = _x;
        this.y = _y;
        this.initialXOffset = Math.random() * 6.24;
        Updatables.add(this);
        Model.stage?.addChild(this.asset!);
        this.asset!.name = "enemy_" + (Enemy.globalId++);
    }

    update(dt: number) {
        let scene: ZScene = ZScene.getSceneById("game-scene")!;
        let dimensions = scene.getInnerDimensions();
        super.update(dt);
        this.x! += Math.cos(performance.now() / 1000 + this.initialXOffset) * 50 * dt;
        //scaleX ossilation
        this.y! += this.speed * dt;
        const newX = this.x!;
        const newY = this.y!;
        this.asset!.x = newX;
        this.asset!.y = newY;

        if (this.y! > dimensions.height) {
            this.destroyEntity();
        }
        this.fixBounds();

        if (this.cannon && this.ship) {
            let collisions = Utils.getCollisionsAllScreen(this, this.fireRadius, Model.enemiesGrid, Model.gridSize, this.ship.constructor.name);
            if (collisions.length > 0) {
                let ship = collisions[0];

                let angleToShip = Math.atan2(ship.y! - this.y!, ship.x! - this.x!);
                let x = this.x! + Math.cos(angleToShip) * this.radius!;
                let y = this.y! + Math.sin(angleToShip) * this.radius!;
                this.cannon.updateFire(dt, x, y, angleToShip);
            }
        }
    }

    setCannon(cannonParams: WeaponObj | null) {
        if (this.cannon) {
            this.cannon.destroyEntity();
            this.cannon = null;
        }
        if (cannonParams) {
            const CannonClass = (window as any).SpaceGame[cannonParams.ClassName!];
            this.cannon = new CannonClass(cannonParams);
        }
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