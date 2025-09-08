// Explosion.ts

import { ZScene } from "zimporter-pixi/dist/ZScene";
import { Entity } from "../../core/Entity";
import { Pool } from "../../core/Pool";
import { Updatables } from "../../core/Updatables";
import { EntityObj, Model } from "../Model";
import { ZContainer } from "zimporter-pixi";



type SmallExplosion = {
    x: number;
    y: number;
    sin: number;
    cos: number;
    len: number;
    scale: number;
    speed: number;
    asset: ZContainer;
};

export class Explosion extends Entity {
    duration: number;
    w: number;
    h: number;
    scale: number = 1;
    count: number = 0;
    x: number = 0;
    y: number = 0;
    smalls: SmallExplosion[] = [];
    num: number = 0;
    assetName: string;

    constructor(params: EntityObj) {
        super(params);
        this.pool = params.pool;
        this.duration = params.duration!;
        this.assetName = params.assetName;

    }

    spawn(_x: number, _y: number) {
        this.x = _x;
        this.y = _y;
        this.count = 0;
        this.scale = 1;
        this.smalls = [];
        const num = Math.floor(Math.random() * 30) + 3;
        for (let i = 0; i < num; i++) {
            let scene = ZScene.getSceneById("game-scene");
            let asset = scene?.spawn(this.assetName);
            this.w = asset!.width;
            this.h = asset!.height;
            const rnd = Math.random() * 6.28;
            const sin = Math.sin(rnd);
            const cos = Math.cos(rnd);
            const obj: SmallExplosion = {
                x: _x,
                y: _y,
                sin,
                cos,
                len: 0,
                scale: Math.random() * 0.3,
                speed: Math.random() * 5,
                asset: asset!
            };
            this.smalls.push(obj);
            asset!.scale.set(obj.scale);
            asset!.x = obj.x;
            asset!.y = obj.y;
            asset!.pivotX = asset!.width / 2;
            asset!.pivotY = asset!.height / 2;
            Model.stage?.addChild(asset!);
        }
        this.num = num;
        Updatables.add(this);

    }

    update(dt: number) {
        this.count += dt;
        this.scale = 1 + this.count / this.duration;
        for (let i = 0; i < this.num; i++) {
            const obj = this.smalls[i];
            obj.len += obj.speed;
            obj.x = this.x + (obj.cos * obj.len * this.scale);
            obj.y = this.y + (obj.sin * obj.len * this.scale);
            obj.asset.x = obj.x;
            obj.asset.y = obj.y;
            const newScale = obj.scale * this.scale;
            obj.asset.scale.set(newScale);
            obj.asset.alpha = 1 - (this.count / this.duration);
        }
        if (this.count >= this.duration) {
            this.destroyEntity();
        }
    }

    destroyEntity() {
        this.pool!.putBack(this);
        Updatables.remove(this);
        for (let i = 0; i < this.num; i++) {
            const obj = this.smalls[i];
            Model.stage?.removeChild(obj.asset);
        }
    }
}