// Assuming you have a base class system, but in TypeScript we use classes directly.

import { BaseObj } from "../game/Model";
import { Entity } from "./Entity";


export class PoolsManager {
    static allPools: Record<string, Pool<Entity>> = {};
    public static getPool(name: string, params: BaseObj): Pool<Entity> | undefined {
        if (!this.allPools[name]) {
            this.allPools[name] = new Pool(params);
        }
        return this.allPools[name];
    }
}


export class Pool<T> {

    private arr: T[];
    private curIndex: number;
    private params: any;

    constructor(obj: BaseObj) {
        const numElements = 1000;
        // So the entity can place itself back inside
        (obj as any).pool = this;
        const CLS_STR = obj.ClassName as unknown as string;
        const CLS = (window as any).SpaceGame[CLS_STR]
        this.arr = [];
        this.curIndex = 0;

        for (let i = 0; i < numElements; i++) {
            const e = new (CLS)(obj);
            this.arr[i] = e;
        }
    }

    get(): T {
        if (this.curIndex >= this.arr.length) {
            let assetName = this.params ? this.params.assetName : "unknown";
            throw new Error(`pool limit exceeded ${this.curIndex} ${assetName}`);
        }
        const e = this.arr[this.curIndex];
        this.curIndex += 1;
        return e;
    }

    putBack(e: T): void {
        if (this.curIndex < 0) {
            let assetName = this.params ? this.params.assetName : "unknown";
            throw new Error(`pool less than 0 ${this.curIndex} ${assetName}`);
        }
        this.curIndex -= 1;
        this.arr[this.curIndex] = e;
    }

    reset(): void {
        this.curIndex = 0;
    }

    destroy(): void {
        this.arr = [];
    }
}
