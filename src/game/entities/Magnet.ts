import { Entity, Updatables, Utils } from "../../core";
import { MagnetObj, Model } from "../Model";
import { Shield } from "./Shield";
import { Ship } from "./Ship";
import * as PIXI from 'pixi.js';

export class Magnet extends Entity {

    private ship: Ship;
    constructor(params: MagnetObj) {
        super(params);
        this.radius = params.radius;

        Updatables.add(this);
    }

    setShip(ship: Ship) {
        this.ship = ship;
        this.circle = new PIXI.Graphics();
        this.circle.lineStyle(2, 0x00FF00, 0.5);
        this.circle.drawCircle(0, 0, this.radius!);
        this.circle.endFill();
        this.ship.asset?.addChild(this.circle);
    }


    update(dt: number) {
        const shipCenter = this.ship.getCenter();
        let collisions: Entity[] = Utils.getCollisions(this.ship, this.radius!, this.grid!, Model.gridSize);
        for (let i = 0; i < collisions.length; i++) {
            let collision = collisions[i];
            //console.log('Magnet pulling collectible:', collision.getType());
            let a = collision.x! - shipCenter.x!;
            let o = collision.y! - shipCenter.y!;
            let dist = Math.sqrt(a * a + o * o);
            let sin = o / dist;
            let cos = a / dist;
            //the smaller the dist, the faster the movement
            dist = (this.radius! - dist) / this.radius! * 300;
            let moveX = cos * dist * dt;
            let moveY = sin * dist * dt;
            collision.x! -= moveX;
            collision.y! -= moveY;
            collision.asset!.x = collision.x!;
            collision.asset!.y = collision.y!;
        }
    }
}