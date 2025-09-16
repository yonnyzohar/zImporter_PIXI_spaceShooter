import * as PIXI from 'pixi.js';
import { MagnetObj, Model, ShieldObj, WeaponObj } from './Model';
import { EventsManager } from './../core/EventsManager';
import { Pool, PoolsManager } from './../core/Pool';
import { Updatables } from './../core/Updatables';
import { TimerService } from './../managers/TimerService';
import { Ship } from './entities/Ship';
import { EnemyManager } from './../managers/EnemyManager';
import { Stars } from './entities//Stars';
import { Healthbar } from './Healthbar';
import { CollectiblesManager } from './../managers/CollectiblesManager';
import { ScoreHolder } from './ScoreHolder';
import { Entity } from '../core/Entity';
import { Explosion } from './entities/Explosion';
import { ZScene } from 'zimporter-pixi';
import { Enemy } from './entities';

type Rect = {
    x: number;
    y: number;
    w: number;
    h: number;
    per: number;
    color: [number, number, number];
};

export class Game {

    private weaponTimerService = new TimerService();
    private shieldTimerService = new TimerService();
    private timerService = new TimerService();

    private enemyManager!: EnemyManager;
    private ship!: Ship;
    private collectiblesManager!: CollectiblesManager;
    private stars!: Stars;
    private healthbar!: Healthbar;
    private scoreHolder!: ScoreHolder;

    private weaponRect: PIXI.Graphics = new PIXI.Graphics();
    private shieldRect: PIXI.Graphics = new PIXI.Graphics();
    private magnetRect: PIXI.Graphics = new PIXI.Graphics();

    private gameOver = false;
    private win = false;
    private callback?: () => void;

    constructor(params?: any) {
        this.init(params);
    }

    init(params?: any) {


        Model.enemiesGrid = {};
        Model.collectiblesGrid = {};
        let dimensions = ZScene.getSceneById("game-scene")?.getInnerDimensions();
        Model.gridSize = Math.min(dimensions!.width, dimensions!.height) / 5;
        //console.log('Grid size:', Model.gridSize);

        const levelsObj = Model.levels[Model.level];

        //Model.pools!.enemy!.params.grid = Model.enemiesGrid;
        //Model.pools!.explosion!.params.grid = undefined;
        //Model.pools!.bullet!.params.grid = Model.enemiesGrid;


        //Model.allPools['enemy'] = new Pool(Model.pools!.enemy!);
        //Model.allPools['explosion'] = new Pool(Model.pools!.explosion!);
        //Model.allPools["bullet"] = new Pool(Model.pools!.bullet!);

        this.healthbar = new Healthbar(levelsObj.healthParams);
        this.stars = new Stars(levelsObj.starsParams, Model.stage!);

        levelsObj.shipParams.grid = Model.enemiesGrid;
        this.ship = new Ship(levelsObj.shipParams);
        this.ship.setCannon(Model.weapons.defaultCannon);

        this.enemyManager = new EnemyManager(levelsObj.enemyManagerParams);
        this.enemyManager.setShip(this.ship);

        this.collectiblesManager = new CollectiblesManager();

        this.scoreHolder = new ScoreHolder();

        EventsManager.addListener('ENEMY_DESTROYED', this.onEnemyDestroyed.bind(this));
        EventsManager.addListener('WEAPON_PICKUP', this.onWeaponPickup.bind(this));
        EventsManager.addListener('SHIELD_PICKUP', this.onShieldPickup.bind(this));
        EventsManager.addListener('MAGNET_PICKUP', this.onMagnetPickup.bind(this));
        EventsManager.addListener("TARGET_HIT", this.onTargetHit.bind(this));
    }

    private onTargetHit(obj: { target: Entity }) {
        const target = obj.target;
        if (target instanceof Enemy) {
            target.destroyEntity();
        }
    }

    onMagnetPickup(obj: MagnetObj) {
        let scene: ZScene = ZScene.getSceneById("game-scene")!;
        let dimensions = scene.getInnerDimensions();
        this.magnetRect.beginFill(obj.color);
        this.magnetRect.drawRect(0, dimensions.height - 60, dimensions.width, 60);
        this.magnetRect.endFill();
        Model.stage!.addChild(this.magnetRect);

        this.shieldTimerService.start(
            obj.time,
            () => {
                this.magnetRect.clear();
                this.ship.setMagnet(undefined);
            },
            (per: number) => {
                let dimensions = scene.getInnerDimensions();
                this.magnetRect.width = dimensions.width * per;
            }
        );
    }

    onWeaponPickup(obj: WeaponObj) {
        let scene: ZScene = ZScene.getSceneById("game-scene")!;
        let dimensions = scene.getInnerDimensions();

        this.weaponRect.beginFill(obj.color!);
        this.weaponRect.drawRect(0, dimensions.height - 20, dimensions.width, 20);
        this.weaponRect.endFill();
        Model.stage!.addChild(this.weaponRect);

        this.weaponTimerService.start(
            obj.time!,
            () => {
                this.weaponRect.clear();
                this.ship.setCannon(Model.weapons.defaultCannon);
            },
            (per: number) => {
                let dimensions = scene.getInnerDimensions();
                this.weaponRect.width = dimensions.width * per;
            }
        );
    }

    onShieldPickup(obj: ShieldObj) {
        let scene: ZScene = ZScene.getSceneById("game-scene")!;
        let dimensions = scene.getInnerDimensions();
        this.shieldRect.beginFill(obj.color);
        this.shieldRect.drawRect(0, dimensions.height - 40, dimensions.width, 40);
        this.shieldRect.endFill();
        Model.stage!.addChild(this.shieldRect);

        this.shieldTimerService.start(
            obj.time,
            () => {
                this.shieldRect.clear();
                this.ship.setShield(undefined);
            },
            (per: number) => {
                let dimensions = scene.getInnerDimensions();
                this.shieldRect.width = dimensions.width * per;
            }
        );
    }

    onEnemyDestroyed(obj: { x: number; y: number }) {

        let pool = PoolsManager.getPool(Model.explosions.defaultExplosion.assetName!, Model.explosions.defaultExplosion);
        const explosion = pool!.get() as unknown as Explosion;
        explosion.spawn(obj.x, obj.y);
        this.collectiblesManager.spawn(obj.x, obj.y);
    }

    update(dt: number) {
        this.stars.update(dt);
        this.enemyManager.update(dt);
        Updatables.update(dt);
        this.draw();
    }

    draw() {

        if (this.gameOver) {
            const text = new PIXI.Text(
                this.win ? 'LEVEL COMPLETE' : 'GAME OVER',
                { fill: 0xffffff, fontSize: 32 }
            );
            let scene: ZScene = ZScene.getSceneById("game-scene")!;
            let dimensions = scene.getInnerDimensions();
            text.x = dimensions.width / 2;
            text.y = dimensions.height / 2;
            Model.stage!.addChild(text);
        }


    }

    onGameOver(callback: () => void, win: boolean) {
        EventsManager.removeListener('WEAPON_PICKUP', this.onWeaponPickup.bind(this));
        EventsManager.removeListener('SHIELD_PICKUP', this.onShieldPickup.bind(this));
        EventsManager.removeListener('ENEMY_DESTROYED', this.onEnemyDestroyed.bind(this));
        this.timerService.start(5, () => {
            this.ship.destroyEntity();
            this.healthbar.destroy();
            this.scoreHolder.destroy();
            Updatables.clear();
            if (callback) callback();
        });
        this.gameOver = true;
        this.win = win;

        this.ship.disable();

        if (!win) {
            this.ship.setRender(false);
        }
    }


}