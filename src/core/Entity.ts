import * as PIXI from 'pixi.js';
import { BaseObj, EntityObj, Model } from '../game/Model';
import { Pool } from './Pool';
import { ZContainer } from 'zimporter-pixi';


export class Entity {
    grid?: Record<string, Record<string, Entity>>;
    prevRow?: number;
    prevCol?: number;
    id: string;
    params: BaseObj;
    pool?: Pool<Entity>;
    asset: ZContainer | undefined;
    x?: number;
    y?: number
    w?: number;
    h?: number
    radius?: number;


    constructor(params: BaseObj) {
        this.params = params;
        this.grid = params.grid;
    }

    public update(dt: number) {
        const col = Math.floor(this.x! / Model.gridSize);
        const row = Math.floor(this.y! / Model.gridSize);
        const grid = this.grid;

        if (grid && row !== this.prevRow || col !== this.prevCol) {
            if (this.prevRow !== undefined && this.prevCol !== undefined && grid) {
                const oldDictName = `${this.prevRow}_${this.prevCol}`;
                const block = grid[oldDictName];
                if (block) {
                    delete block[this.id];
                }
            }
            if (grid) {
                const newDictName = `${row}_${col}`;
                if (!grid[newDictName]) {
                    grid[newDictName] = {};
                }
                grid[newDictName][this.id] = this;
            }
            this.prevRow = row;
            this.prevCol = col;
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