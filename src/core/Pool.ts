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
        const numElements = 100;
        // So the entity can place itself back inside
        (obj as any).pool = this;
        const CLS_STR = obj.ClassName as unknown as string;
        const CLS = (window as any).SpaceGame[CLS_STR]
        this.arr = [];
        this.curIndex = 1;

        for (let i = 0; i < numElements; i++) {
            const e = new (CLS)(obj);
            this.arr[i] = e;
        }
    }

    get(): T {
        const e = this.arr[this.curIndex - 1];
        if (!e) {
            let assetName = this.params ? this.params.assetName : "unknown";
            throw new Error(`pool limit exceeded ${this.curIndex} ${assetName}`);
        }
        this.curIndex += 1;
        return e;
    }

    putBack(e: T): void {
        this.curIndex -= 1;
        if (this.curIndex < 1) {
            let assetName = this.params ? this.params.assetName : "unknown";
            throw new Error(`pool less than 1 ${this.curIndex} ${assetName}`);
        }
        this.arr[this.curIndex - 1] = e;
    }

    reset(): void {
        this.curIndex = 1;
    }

    destroy(): void {
        this.arr = [];
    }
}
