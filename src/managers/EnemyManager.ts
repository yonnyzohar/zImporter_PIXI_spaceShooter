
import { Pool } from "../core/Pool";
import { Entity } from "../core/Entity";
import { EnemyManagerParams, Model } from "../game/Model";
import { EventsManager } from "../core/EventsManager";
import { Enemy } from "../game/entities/Enemy";
import { ZScene } from "zimporter-pixi/dist/ZScene";




export class EnemyManager {
    private pool: Pool<Entity>;
    private spawnRate: number;
    private totalEnemies: number;
    private count: number = 0;

    constructor(params: EnemyManagerParams) {
        this.pool = params.pool!;
        this.spawnRate = params.spawnRate;
        this.totalEnemies = params.totalEnemies;
    }

    update(dt: number) {

        this.count += dt;
        if (this.count >= this.spawnRate && this.totalEnemies > 0) {
            const enemy = this.pool.get() as Enemy;
            enemy.grid = Model.enemiesGrid;
            let scene: ZScene = ZScene.getSceneById("game-scene")!;
            let dimensions = scene.getInnerDimensions();

            const tenPerStage = dimensions.width * 0.1;
            const eightyPerStage = dimensions.width * 0.8;
            const rndInRange = eightyPerStage * Math.random();

            enemy.spawn(tenPerStage + rndInRange, -20);
            this.count = 0;
            this.totalEnemies -= 1;

            if (this.totalEnemies <= 0) {
                EventsManager.emit("GAME_OVER", { win: true });
            }
        }
    }
}