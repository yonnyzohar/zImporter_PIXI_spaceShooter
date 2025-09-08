import * as PIXI from 'pixi.js';
import { Entity } from './../../core/Entity';
import { Model, ShieldObj, WeaponObj } from './../Model';
import { Updatables } from './../../core/Updatables';
import { Utils } from './../../core/Utils';
import { EventsManager } from './../../core/EventsManager';
import { EntityObj } from '../Model';
import { Shield } from './Shield';
import { ZScene } from 'zimporter-pixi';
import { Cannon } from './Cannon';


export class Ship extends Entity {
    cannon: Cannon | null = null;
    shield: Shield | null = null;
    speed: number;
    defaultCannonName: string;
    radius: number;
    velX = 0;
    velY = 0;
    decelaration: number;
    acceleration: number;
    disabled = false;
    disableRendering = false;
    shock = false;
    shockVal = 0;

    constructor(params: EntityObj) {
        super(params);
        this.speed = params.speed!;
        this.defaultCannonName = params.cannonName!;
        let scene: ZScene = ZScene.getSceneById("game-scene")!;
        let dimensions = scene.getInnerDimensions();
        this.asset = scene?.spawn(params.assetName);

        Model.stage?.addChild(this.asset!);
        this.x = dimensions.width / 2;
        this.y = dimensions.height / 2;
        this.asset!.x = this.x;
        this.asset!.y = this.y;
        this.asset!.pivotX = this.asset!.width / 2;
        this.asset!.pivotY = this.asset!.height / 2;
        this.w = this.asset!.width;
        this.h = this.asset!.height;
        this.radius = Math.min(this.w, this.h!) / 2;
        this.decelaration = params.deceleration!;
        this.acceleration = params.acceleration!;
        Updatables.add(this);
        EventsManager.addListener('CANNON_COLLECTED', this.setCannon.bind(this));
    }

    getCenter() {
        return { x: this.x, y: this.y };
    }

    disable() {
        this.disabled = true;
    }

    setShield(shieldParams: ShieldObj | undefined) {
        if (this.shield) {
            this.shield.destroyEntity();
            this.shield = null;
        }
        if (shieldParams) {
            let ShieldClass = (window as any).SpaceGame[shieldParams.ClassName!];
            this.shield = new ShieldClass(shieldParams);
            this.shield!.setShip(this);
        }
    }

    setCannon(cannonParams?: WeaponObj) {
        if (this.cannon) {
            this.cannon.destroyEntity();
        }
        if (!cannonParams) {
            cannonParams = Model.weapons[this.defaultCannonName];
        }
        const CannonClass = (window as any).SpaceGame[cannonParams.ClassName!];
        this.cannon = new CannonClass(cannonParams);
    }

    fixBounds() {
        let scene: ZScene = ZScene.getSceneById("game-scene")!;
        let dimensions = scene.getInnerDimensions();
        if ((this.x! + this.w! / 2) > dimensions.width) {
            this.x = dimensions.width - this.w! / 2;
        }
        if ((this.x! - this.w! / 2) < 0) {
            this.x = this.w! / 2;
        }
        if ((this.y! + this.h! / 2) > dimensions.height) {
            this.y = dimensions.height - this.h! / 2;
        }
        if ((this.y! - this.h! / 2) < 0) {
            this.y = this.h! / 2;
        }
    }

    update(dt: number) {
        if (this.disabled) return;

        super.update(dt);

        const { left, right, up, down } = Model.movement;
        let moving = false;

        if (left) {
            moving = true;
            this.velX -= this.acceleration;
            if (this.velX < -1) this.velX = -1;
        }
        if (right) {
            moving = true;
            this.velX += this.acceleration;
            if (this.velX > 1) this.velX = 1;
        }
        if (up) {
            moving = true;
            this.velY -= this.acceleration;
            if (this.velY < -1) this.velY = -1;
        }
        if (down) {
            moving = true;
            this.velY += this.acceleration;
            if (this.velY > 1) this.velY = 1;
        }

        if (!moving) {
            if (this.velX !== 0) {
                if (this.velX < 0) {
                    this.velX += this.decelaration;
                    if (this.velX >= 0) this.velX = 0;
                } else {
                    this.velX -= this.decelaration;
                    if (this.velX <= 0) this.velX = 0;
                }
            }
            if (this.velY !== 0) {
                if (this.velY < 0) {
                    this.velY += this.decelaration;
                    if (this.velY >= 0) this.velY = 0;
                } else {
                    this.velY -= this.decelaration;
                    if (this.velY <= 0) this.velY = 0;
                }
            }
        }

        this.x! += this.velX * this.speed * dt;
        this.y! += this.velY * this.speed * dt;
        this.asset!.x = this.x!;
        this.asset!.y = this.y!;

        this.fixBounds();

        if (this.cannon) {
            this.cannon.updateFire(dt, this.x!, this.y! - this.h! / 2);
        }

        let collision = Utils.getCollision(this, this.radius, Model.collectiblesGrid, Model.gridSize);

        if (collision) {
            if (collision.params.type === 'collecible') {
                EventsManager.emit('COIN_COLLECTED');
            } else if (collision.params.type === 'health') {
                EventsManager.emit('HEALTHPACK_PICKUP');
            } else if (collision.params.type === 'weapon') {
                const newWeapon = Model.weapons[collision.id];
                this.setCannon(newWeapon);
                if (newWeapon.time) {
                    EventsManager.emit('WEAPON_PICKUP', newWeapon);
                }
            } else if (collision.params.type === 'shield') {
                const newShield = Model.shields[collision.id];
                this.setShield(newShield);
                if (newShield.time) {
                    EventsManager.emit('SHIELD_PICKUP', newShield);
                }
            }
            collision.destroyEntity();
        }

        collision = Utils.getCollision(this, this.radius, Model.enemiesGrid, Model.gridSize);
        if (collision) {
            collision.destroyEntity();
            EventsManager.emit('ENEMY_DESTROYED', { x: collision.x, y: collision.y });
            if (!this.shield) {
                this.shock = true;
                this.shockVal = 0;
                EventsManager.emit('SHIP_COLISSION', { x: this.x, y: this.y });
            }
        }
        this.draw();
    }

    destroyEntity() {
        Updatables.remove(this);
        if (this.cannon) {
            this.cannon.destroyEntity();
        }
        super.destroyEntity();
    }

    setRender(v: boolean) {
        this.disableRendering = v;
    }

    draw() {
        if (this.disableRendering) return;

        let render = true;
        if (this.shock) {
            this.shockVal += 1;
            if (this.shockVal % 2 === 0) {
                render = false;
            }
            if (this.shockVal > 50) {
                this.shock = false;
            }
        }
        if (render) {
            if (!Model.stage!.children.includes(this.asset!)) {
                Model.stage!.addChild(this.asset!);
            }
        } else {
            if (Model.stage!.children.includes(this.asset!)) {
                Model.stage!.removeChild(this.asset!);
            }
        }
    }
}
