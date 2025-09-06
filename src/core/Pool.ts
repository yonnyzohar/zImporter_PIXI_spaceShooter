// Assuming you have a base class system, but in TypeScript we use classes directly.

import { PoolsObj } from "../game/Model";


export class Pool<T> {
    private arr: T[];
    private curIndex: number;
    private params: any;

    constructor(params: PoolsObj) {
        const numElements = params.numElements;
        const p = params.params;
        this.params = p;
        // So the entity can place itself back inside
        (p as any).pool = this;
        const CLS_STR = this.params.ClassName as unknown as string;
        const CLS = (window as any).SpaceGame[CLS_STR]
        this.arr = [];
        this.curIndex = 1;

        for (let i = 0; i < numElements; i++) {
            const e = new (CLS)(p);
            this.arr[i] = e;
        }
    }

    get(): T {
        const e = this.arr[this.curIndex - 1];
        if (!e) {
            throw new Error(`pool limit exceeded ${this.curIndex} ${this.params.assetName}`);
        }
        this.curIndex += 1;
        return e;
    }

    putBack(e: T): void {
        this.curIndex -= 1;
        if (this.curIndex < 1) {
            throw new Error(`pool less than 1 ${this.curIndex} ${this.params.assetName}`);
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
