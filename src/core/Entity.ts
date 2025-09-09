import * as PIXI from 'pixi.js';
import { BaseObj, EntityObj, Model } from '../game/Model';
import { Pool } from './Pool';
import { ZContainer } from 'zimporter-pixi';


export class Entity {
    grid?: Record<string, Map<Entity, boolean>>;
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
    private type: string;


    constructor(params: BaseObj) {
        this.params = params;
        if (params.grid) {
            this.grid = params.grid;
        }

        this.type = params.type;
    }

    public getType(): string {
        return this.type;
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
                    const map: Map<Entity, boolean> = grid[oldDictName];
                    map.delete(this);
                }
            }
            if (grid) {
                const newDictName = `${row}_${col}`;
                if (!grid[newDictName]) {
                    grid[newDictName] = new Map<Entity, boolean>();
                }
                grid[newDictName].set(this, true);
            }
            this.prevRow = row;
            this.prevCol = col;
        }
    }

    render() {
        if (this.asset && typeof this.x === 'number') {
            this.asset.x = this.x;
        }
        if (this.asset && typeof this.y === 'number') {
            this.asset.y = this.y;
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
            const map: Map<Entity, boolean> = grid[oldDictName];
            map.delete(this);
        }
        if (grid[newDictName]) {
            const map: Map<Entity, boolean> = grid[newDictName];
            map.delete(this);
        }
        this.prevRow = undefined;
        this.prevCol = undefined;
        if (this.asset && this.asset.parent) {
            this.asset.parent.removeChild(this.asset);
        }
    }
}