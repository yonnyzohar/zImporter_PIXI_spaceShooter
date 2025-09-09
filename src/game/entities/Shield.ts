import { ZContainer, ZScene } from "zimporter-pixi";
import { Updatables } from "../../core/Updatables";
import { Model, ShieldObj } from "../Model";
import { Entity } from "../../core/Entity";
import { Ship } from "./Ship";
import { EventsManager, Utils } from "../../core";

interface ShieldObject {
    degree: number;
    entity: Entity;
}

export class Shield {
    speed: number;
    radius: number;
    shields: ShieldObject[] = [];
    w: number;
    h: number;
    ship: Ship;

    constructor(params: ShieldObj) {
        this.speed = params.speed;
        this.radius = params.radius;
        let scene = ZScene.getSceneById("game-scene");

        const increment = 360 / params.numShields;
        let curr = 0;

        for (let i = 0; i < params.numShields; i++) {

            let s = new Entity(params);
            s.setGrid(Model.enemiesGrid);
            Model.stage?.addChild(s.asset!);

            Updatables.add(s);
            this.shields.push({ degree: curr, entity: s! });
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
            obj.entity!.x = x + shipCenter.x!;
            obj.entity!.y = y + shipCenter.y!;
            obj.entity!.render();
            const collisions = Utils.getCollisions(obj.entity, obj.entity.radius!, Model.enemiesGrid, Model.gridSize);

            if (collisions) {
                for (let i = 0; i < collisions.length; i++) {
                    let collision = collisions[i];
                    collision.destroyEntity();
                    EventsManager.emit("ENEMY_DESTROYED", { x: collision.x, y: collision.y });
                }
            }
        }
    }

    destroyEntity() {
        Updatables.remove(this);
        for (const obj of this.shields) {
            obj.entity!.destroyEntity();
        }
    }
}