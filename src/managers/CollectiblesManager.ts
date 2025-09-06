

// This class handles all collectibles left by dead enemies.
// First, this class parses the probabilities table to determine what will be spawned.
// Then, when an enemy dies, it spawns according to that probability - a coin, health pack, or weapon.

import { Model, PoolsObj, SpawnProbabilities } from "../game/Model";
import { Utils } from "../core/Utils";
import { Collectible } from "../game/Collectible";
import { Pool } from "../core/Pool";

type CollectibleName = keyof typeof Model.spawnProbabilities;
type ProbabilityEntry = {
    name: CollectibleName;
    startVal: number;
    endVal: number;
};


export class CollectiblesManager {
    private probabilitiesArr: ProbabilityEntry[] = [];

    constructor(params?: any) {
        let curr = 0;
        const arr: ProbabilityEntry[] = [];
        const props: SpawnProbabilities = Utils.deepcopy(Model.spawnProbabilities);
        let total = 0;

        // Work out how many altogether
        for (const k of Object.keys(props) as CollectibleName[]) {
            total += props[k];
        }
        for (const k of Object.keys(props) as CollectibleName[]) {
            props[k] = props[k] / total;
        }

        for (const k of Object.keys(props) as CollectibleName[]) {
            if (!Model.allPools[k]) {
                const poolParams = Model.pools![k] || {
                    numElements: 50,
                    params: Model.collectibles[k]
                } as PoolsObj;
                Model.allPools[k] = new Pool(poolParams);
            }
            arr.push({ name: k, startVal: curr, endVal: props[k] + curr });
            curr += props[k];
        }
        /*  */
        this.probabilitiesArr = arr;
    }

    spawn(_x: number, _y: number) {
        const rnd = Math.random();
        for (let i = 0; i < this.probabilitiesArr.length; i++) {
            const obj = this.probabilitiesArr[i];
            if (rnd >= obj.startVal && rnd <= obj.endVal) {
                const pool = Model.allPools[obj.name];
                const prize = pool.get() as unknown as Collectible;
                prize.id = obj.name; // this is the magic connection!
                prize.grid = Model.collectiblesGrid;
                prize.spawn(_x, _y);
                // type = "collectible"
                // type = "health"
                // type = "weapon"
                break;
            }
        }
    }
}