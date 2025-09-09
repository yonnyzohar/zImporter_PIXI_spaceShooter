import { Entity, Utils } from "../../core";
import { MagnetObj, Model } from "../Model";
import { Shield } from "./Shield";
import { Ship } from "./Ship";

export class Magnet extends Entity {

    private ship: Ship;
    constructor(params: MagnetObj) {
        super(params);
        this.radius = params.radius;
    }

    setShip(ship: Ship) {
        this.ship = ship;
    }


    update(dt: number) {
        const shipCenter = this.ship.getCenter();
        let collisions = Utils.getCollisions(this.ship, this.radius!, Model.collectiblesGrid, Model.gridSize);
        for (let collision of collisions) {
            let a = collision.x! - shipCenter.x!;
            let o = collision.y! - shipCenter.y!;
            let dist = Math.sqrt(a * a + o * o);
            let sin = o / dist;
            let cos = a / dist;
            let moveX = cos * dist * dt;
            let moveY = sin * dist * dt;
            collision.x = collision.x! - moveX;
            collision.y = collision.y! - moveY;
            collision.asset!.x = collision.x;
            collision.asset!.y = collision.y;
        }
    }
}