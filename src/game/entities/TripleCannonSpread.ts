import { Entity } from "../../core/Entity";
import { Pool } from "../../core/Pool";
import { Model, WeaponObj } from "../Model";
import { Bullet } from "./Bullet";
import { Cannon } from "./Cannon";



export class TripleCannonSpread extends Entity {
    private bulletsPool: Pool<Entity>;
    private fireCounter: number = 0;
    private fireRate: number;
    private numTurrets: number;
    private spreadAngle: number;

    constructor(params: WeaponObj) {
        super(params);
        // Assuming allPools is a global object
        if (!Model.allPools) {
            Model.allPools = {};
        }
        const AllPools = Model.allPools;

        // Pool initialization logic
        this.bulletsPool = AllPools["bullet"];
        AllPools["bullet"] = this.bulletsPool;

        this.fireRate = params.fireRate;
        this.numTurrets = params.numTurrets;
        this.spreadAngle = params.spreadAngle!;
    }

    updateFire(dt: number, spawnX: number, spawnY: number) {
        // Assuming Model.movement.space is a boolean indicating fire
        const fire = Model.movement.space;
        this.fireCounter += dt;

        if (this.fireCounter >= this.fireRate) {
            // Fire three bullets with spread
            const upAngle = (Math.PI * 2) - (Math.PI / 2);

            let bullet: Bullet = this.bulletsPool.get() as unknown as Bullet;
            bullet.fire(spawnX, spawnY, upAngle - this.spreadAngle);

            bullet = this.bulletsPool.get() as unknown as Bullet;
            bullet.fire(spawnX, spawnY, upAngle);

            bullet = this.bulletsPool.get() as unknown as Bullet;;
            bullet.fire(spawnX, spawnY, upAngle + this.spreadAngle);

            this.fireCounter = 0;
        }
    }

    destroy() {
        // Implement destroy logic if needed
    }
}