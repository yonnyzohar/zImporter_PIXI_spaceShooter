import { Entity } from "../../core/Entity";
import { Pool } from "../../core/Pool";
import { Model, WeaponObj } from "../Model";
import { Bullet } from "./Bullet";




export class Cannon extends Entity {
    private bulletsPool: Pool<Entity>;
    private fireCounter: number = 0;
    private fireRate: number;
    private numTurrets: number;
    private cannonSpacing: number;

    constructor(params: WeaponObj) {
        super(params);
        this.bulletsPool = Model.allPools["bullet"];
        Model.allPools["bullet"] = this.bulletsPool;
        this.fireRate = params.fireRate;
        this.numTurrets = params.numTurrets;
        this.cannonSpacing = params.cannonSpacing;
    }

    public updateFire(dt: number, spawnX: number, spawnY: number) {
        // const fire = Model.movement.space; // Uncomment if needed
        this.fireCounter += dt;

        if (this.fireCounter >= this.fireRate) {
            const upAngle = (Math.PI * 2) - (Math.PI / 2);
            let startX = spawnX - (((this.numTurrets - 1) / 2) * this.cannonSpacing);

            for (let i = 0; i < this.numTurrets; i++) {
                const bullet: Bullet = this.bulletsPool.get() as unknown as Bullet;
                console.log('Firing bullet from cannon at position:', startX, spawnY);
                bullet.fire(startX, spawnY, upAngle);
                startX += this.cannonSpacing;
            }

            this.fireCounter = 0;
        }
    }

    destroyEntity() {
        const grid = this.grid;
        if (!grid) return;
        const col = Math.floor(this.x! / Model.gridSize);
        const row = Math.floor(this.y! / Model.gridSize);
        const newDictName = `${row}_${col}`;
        const oldDictName = `${this.prevRow}_${this.prevCol}`;
        if (grid[oldDictName]) {
            delete grid[oldDictName][this.id];
        }
        if (grid[newDictName]) {
            delete grid[newDictName][this.id];
        }
        this.prevRow = undefined;
        this.prevCol = undefined;
    }
}