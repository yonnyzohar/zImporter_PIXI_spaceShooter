import * as PIXI from 'pixi.js';
import { MagnetObj, Model, ShieldObj, WeaponObj } from './Model';
import { EventsManager } from './../core/EventsManager';
import { Pool, PoolsManager } from './../core/Pool';
import { Updatables } from './../core/Updatables';
import { TimerService, TimersManager } from './../managers/TimerService';
import { Ship } from './entities/Ship';
import { EnemyManager } from './../managers/EnemyManager';
import { Stars } from './entities//Stars';
import { Healthbar } from './Healthbar';
import { CollectiblesManager } from './../managers/CollectiblesManager';
import { ScoreHolder } from './ScoreHolder';
import { Entity } from '../core/Entity';
import { Explosion } from './entities/Explosion';
import { ZContainer, ZScene, ZTimeline } from 'zimporter-pixi';
import { Enemy } from './entities';
import { PlanetsManager } from '../managers/PlanetsManager';


export class Game {

    private timersManager = new TimersManager();

    private enemyManager!: EnemyManager;
    private ship!: Ship;
    private collectiblesManager!: CollectiblesManager;
    private stars!: Stars;
    private planetsManager!: PlanetsManager;
    private healthbar!: Healthbar;
    private scoreHolder!: ScoreHolder;



    private gameOver = false;
    private win = false;
    private callback?: () => void;

    constructor(params?: any) {
        this.init();
    }

    public reset() {
        this.timersManager.destroyAll();
        this.collectiblesManager?.clear();
        this.enemyManager?.clear();
        Model.enemiesGrid = {};
        Model.collectiblesGrid = {};
        this.gameOver = false;
        this.win = false;
        this.callback = undefined;
        PoolsManager.resetAllPools();
        this.healthbar?.removeFromParent();
        this.scoreHolder?.destroy();
        this.ship?.destroyEntity();
        this.enemyManager?.destroy();
        this.enemyManager = undefined!;
        this.collectiblesManager = undefined!;
        Updatables.clearWithCleanup();
    }

    init() {

        this.reset();

        let dimensions = ZScene.getSceneById("game-scene")?.getInnerDimensions();
        Model.gridSize = Math.min(dimensions!.width, dimensions!.height) / 5;

        const levelsObj = Model.levels[Model.level];

        this.healthbar = new Healthbar(levelsObj.healthParams);
        if (!this.stars) {
            this.stars = new Stars(levelsObj.starsParams, Model.stage!);
        }
        // planets layer added right after stars so it renders above stars but below everything else
        if (!this.planetsManager) {
            this.planetsManager = new PlanetsManager(Model.stage!);
        }

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

        this.timersManager.addTime(
            "magnet",
            obj.time,
            obj.color!,
            () => {
                this.ship.setMagnet(undefined);
            }
        );
    }

    onWeaponPickup(obj: WeaponObj) {


        this.timersManager.addTime(
            "weapon",
            obj.time!,
            obj.color!,
            () => {
                this.ship.setCannon(Model.weapons.defaultCannon);
            }
        );
    }

    onShieldPickup(obj: ShieldObj) {

        this.timersManager.addTime(
            "shield",
            obj.time,
            obj.color,
            () => {
                this.ship.setShield(undefined);
            }
        );
    }

    private static readonly KILL_MESSAGES = [
        'AMAZING!', 'AWESOME!', 'NICE SHOT!', 'BOOM!', 'OBLITERATED!',
        'GOOD JOB!', 'EXCELLENT!', 'SPECTACULAR!', 'DESTROYED!', 'NAILED IT!'
    ];

    onEnemyDestroyed(obj: { x: number; y: number }) {

        let pool = PoolsManager.getPool(Model.explosions.defaultExplosion.assetName!, Model.explosions.defaultExplosion);
        const explosion = pool!.get() as unknown as Explosion;
        explosion.spawn(obj.x, obj.y);
        this.collectiblesManager.spawn(obj.x, obj.y);

        const scene: ZScene = ZScene.getSceneById("game-scene")!;
        const anim: ZTimeline = scene.spawn("WinMsg") as ZTimeline;
        if (anim) {
            const textContainer = anim.get("textContainer") as ZContainer;
            if (textContainer) {
                const msg = Game.KILL_MESSAGES[Math.floor(Math.random() * Game.KILL_MESSAGES.length)];
                textContainer.setText(msg);
            }
            anim.x = obj.x;
            anim.y = obj.y;
            Model.stage!.addChild(anim);
            anim.play();
            anim.addStateEndEventListener(() => {
                anim.stop();
                anim.removeStateEndEventListener();
                Model.stage!.removeChild(anim);
            });
        }
    }

    update(dt: number) {
        this.stars.update(dt);
        this.planetsManager.update(dt);
        this.enemyManager.update(dt);
        Updatables.update(dt);
        this.draw();
    }

    draw() { }

    onGameOver(callback: () => void, win: boolean) {
        EventsManager.removeListener('WEAPON_PICKUP', this.onWeaponPickup.bind(this));
        EventsManager.removeListener('SHIELD_PICKUP', this.onShieldPickup.bind(this));
        EventsManager.removeListener('ENEMY_DESTROYED', this.onEnemyDestroyed.bind(this));

        this.gameOver = true;
        this.win = win;
        const scene: ZScene = ZScene.getSceneById("game-scene")!;
        const anim: ZTimeline = scene.spawn("GameOverTemplate") as ZTimeline;
        let textContainer = anim.get("textContainer") as ZContainer;
        if (textContainer) {
            if (win) {
                textContainer.setText("LEVEL COMPLETE");
            }
            else {
                textContainer.setText("GAME OVER");
            }
        }

        const dimensions = scene.getInnerDimensions();

        anim.x = dimensions.width / 2;
        anim.y = dimensions.height / 2;
        Model.stage!.addChild(anim);
        anim.play();
        anim.addStateEndEventListener(() => {
            this.ship.destroyEntity();
            this.healthbar.destroy();
            this.scoreHolder.destroy();
            Updatables.clearWithCleanup();
            anim.stop();
            anim.removeStateEndEventListener();
            Model.stage!.removeChild(anim);
            if (callback) callback();
        });

        this.ship.disable();

        if (!win) {
            this.ship.setRender(false);
        }

    }


}