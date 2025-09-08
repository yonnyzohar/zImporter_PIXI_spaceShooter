import * as PIXI from 'pixi.js';
import { Model, ShieldObj, WeaponObj } from './Model';
import { EventsManager } from './../core/EventsManager';
import { Pool } from './../core/Pool';
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
    private gameOver = false;
    private win = false;
    private callback?: () => void;

    constructor(params?: any) {
        this.init(params);
    }

    init(params?: any) {


        Model.enemiesGrid = {};
        Model.collectiblesGrid = {};

        const levelsObj = Model.levels[Model.level];

        Model.allPools['enemy'] = new Pool(Model.pools!.enemy!);
        Model.allPools['explosion'] = new Pool(Model.pools!.explosion!);
        Model.allPools["bullet"] = new Pool(Model.pools!.bullet!);

        this.healthbar = new Healthbar(levelsObj.healthParams);
        this.stars = new Stars(levelsObj.starsParams, Model.stage!);

        levelsObj.shipParams.grid = Model.enemiesGrid;
        this.ship = new Ship(levelsObj.shipParams);
        this.ship.setCannon(Model.weapons.defaultCannon);

        levelsObj.enemyManagerParams.pool = Model.allPools['enemy'];
        this.enemyManager = new EnemyManager(levelsObj.enemyManagerParams);

        this.collectiblesManager = new CollectiblesManager();

        this.scoreHolder = new ScoreHolder({
            enemyVal: levelsObj.enemyParams.value!,
            collectibleVal: Model.collectibles.coin.value!,
        });

        EventsManager.addListener('ENEMY_DESTROYED', this.onEnemyDestroyed.bind(this));
        EventsManager.addListener('WEAPON_PICKUP', this.onWeaponPickup.bind(this));
        EventsManager.addListener('SHIELD_PICKUP', this.onShieldPickup.bind(this));
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
                this.ship.setCannon(undefined);
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
        const explosion = Model.allPools['explosion'].get() as unknown as Explosion;
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
            for (const k in Model.allPools) {
                // Model.allPools[k].reset();
            }
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