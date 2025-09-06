import * as PIXI from 'pixi.js';
import { Model } from './Model';
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

    private weaponRect?: Rect;
    private shieldRect?: Rect;
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

        Model.allPools['enemy'] = new Pool(Model.pools.enemy as any);
        Model.allPools['explosion'] = new Pool(Model.pools.explosion as any);
        Model.allPools["bullet"] = new Pool(Model.pools.bullet as any);

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

    onWeaponPickup(obj: any) {
        this.weaponRect = {
            x: 0,
            y: Model.stageHeight! - 20,
            w: Model.stageWidth!,
            h: 20,
            per: 0,
            color: obj.color,
        };
        this.weaponTimerService.start(
            obj.time,
            this,
            this.onWeaponTimerComplete.bind(this),
            this.onWeaponUpdate.bind(this)
        );
    }

    onShieldPickup(obj: any) {
        this.shieldRect = {
            x: 0,
            y: Model.stageHeight! - 40,
            w: Model.stageWidth!,
            h: 20,
            per: 0,
            color: obj.color,
        };
        this.shieldTimerService.start(
            obj.time,
            this,
            this.onShieldTimerComplete.bind(this),
            this.onShieldUpdate.bind(this)
        );
    }

    onWeaponUpdate(per: number) {
        if (this.weaponRect) this.weaponRect.per = per;
    }

    onShieldUpdate(per: number) {
        if (this.shieldRect) this.shieldRect.per = per;
    }

    onShieldTimerComplete() {
        this.shieldRect = undefined;
        this.ship.setShield(undefined);
    }

    onWeaponTimerComplete() {
        this.weaponRect = undefined;
        this.ship.setCannon(undefined);
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
            text.x = Model.stageWidth! / 2;
            text.y = Model.stageHeight! / 2;
            Model.stage!.addChild(text);
        }

        if (this.weaponRect) {
            const wr = this.weaponRect;
            const graphics = new PIXI.Graphics();
            graphics.beginFill(PIXI.utils.rgb2hex(wr.color));
            graphics.drawRect(wr.x, wr.y, wr.w * (1 - wr.per), wr.h);
            graphics.endFill();
            Model.stage!.addChild(graphics);
        }

        if (this.shieldRect) {
            const sr = this.shieldRect;
            const graphics = new PIXI.Graphics();
            graphics.beginFill(PIXI.utils.rgb2hex(sr.color));
            graphics.drawRect(sr.x, sr.y, sr.w * (1 - sr.per), sr.h);
            graphics.endFill();
            Model.stage!.addChild(graphics);
        }
    }

    onGameOver(callback: () => void, win: boolean) {
        EventsManager.removeListener('WEAPON_PICKUP', this.onWeaponPickup.bind(this));
        EventsManager.removeListener('SHIELD_PICKUP', this.onShieldPickup.bind(this));
        EventsManager.removeListener('ENEMY_DESTROYED', this.onEnemyDestroyed.bind(this));
        this.timerService.start(5, this, this.onTimerComplete.bind(this));
        this.callback = callback;
        this.gameOver = true;
        this.win = win;

        this.ship.disable();

        if (!win) {
            this.ship.setRender(false);
        }
    }

    onTimerComplete() {
        for (const k in Model.allPools) {
            // Model.allPools[k].reset();
        }
        this.ship.destroyEntity();
        this.healthbar.destroy();
        this.scoreHolder.destroy();
        Updatables.clear();
        if (this.callback) this.callback();
    }
}