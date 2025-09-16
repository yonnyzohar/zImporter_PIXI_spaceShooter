
import { Pool, PoolsManager } from "../core/Pool";
import { Entity } from "../core/Entity";
import { EnemyManagerParams, EnemyObj, Model } from "../game/Model";
import { EventsManager } from "../core/EventsManager";
import { Enemy } from "../game/entities/Enemy";
import { ZScene } from "zimporter-pixi/dist/ZScene";
import { Utils } from "../core/Utils";




export class EnemyManager {
    private spawnRate: number;
    private totalEnemies: number;
    private count: number = 0;
    private ship!: Entity;
    private enemyObjects: EnemyObj[] = [];

    constructor(params: EnemyManagerParams) {
        this.spawnRate = params.spawnRate;
        this.totalEnemies = params.totalEnemies;
        for (let i = 0; i < params.enemies.length; i++) {
            let enemyName = params.enemies[i];
            this.enemyObjects.push(Model.enemies[enemyName]);
        }
    }



    setShip(ship: Entity) {
        this.ship = ship;
    }

    update(dt: number) {

        this.count += dt;
        if (this.count >= this.spawnRate && this.totalEnemies > 0) {

            let randomObj = this.enemyObjects[Math.floor(Math.random() * this.enemyObjects.length)];
            let pool = PoolsManager.getPool(randomObj.assetName!, randomObj);
            const enemy = pool!.get() as Enemy;
            enemy.pool = pool!;
            enemy.setGrid(Model.enemiesGrid);
            let scene: ZScene = ZScene.getSceneById("game-scene")!;
            let dimensions = scene.getInnerDimensions();

            const tenPerStage = dimensions.width * 0.1;
            const eightyPerStage = dimensions.width * 0.8;
            const rndInRange = eightyPerStage * Math.random();

            enemy.spawn(tenPerStage + rndInRange, -20);
            enemy.setShip(this.ship);
            this.count = 0;
            this.totalEnemies -= 1;

            if (this.totalEnemies <= 0) {
                EventsManager.emit("GAME_OVER", { win: true });
            }
        }
    }
}