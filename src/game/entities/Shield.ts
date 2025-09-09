import { ZScene } from "zimporter-pixi";
import { Updatables } from "../../core/Updatables";
import { Model, ShieldObj } from "../Model";
import { Entity } from "../../core/Entity";
import { Ship } from "./Ship";

interface ShieldObject {
    degree: number;
    x?: number;
    y?: number;
}

export class Shield extends Entity {
    speed: number;
    radius: number;
    shields: ShieldObject[] = [];
    w: number;
    h: number;
    ship: Ship;

    constructor(params: ShieldObj) {
        super(params);
        this.speed = params.speed;
        this.radius = params.radius;
        let scene = ZScene.getSceneById("game-scene");
        this.asset = scene?.spawn(params.assetName);
        Model.stage?.addChild(this.asset!);
        this.w = this.asset!.width;
        this.h = this.asset!.height;

        const increment = 360 / params.numShields;
        let curr = 0;

        for (let i = 0; i < params.numShields; i++) {
            this.shields.push({ degree: curr });
            curr += increment;
        }

        Updatables.add(this);
    }

    setShip(ship: Ship) {
        this.ship = ship;
    }

    update(dt: number) {
        const shipCenter = this.ship.getCenter();
        for (const obj of this.shields) {
            const rad = obj.degree * Math.PI / 180;
            const x = Math.cos(rad) * this.radius;
            const y = Math.sin(rad) * this.radius;

            obj.degree += this.speed * dt;
            obj.x = x + shipCenter.x!;
            obj.y = y + shipCenter.y!;
            this.asset!.x = obj.x!;
            this.asset!.y = obj.y!;
        }
    }

    destroyEntity() {
        Updatables.remove(this);
        if (this.asset) {
            Model.stage?.removeChild(this.asset!);
        }
    }
}