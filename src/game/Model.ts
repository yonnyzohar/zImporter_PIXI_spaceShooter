
import * as PIXI from 'pixi.js';
import { Utils } from '../core/Utils';
import { Entity } from '../core/Entity';
import { Pool } from '../core/Pool';
import { Enemy } from './entities/Enemy';

export interface Movement {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    space: boolean;
}

export interface StarObj {
    radius: number;
    speed: number;
    numStars: number;
}

export interface EnemyManagerParams {
    pool?: Pool<Entity>;
    spawnRate: number;
    totalEnemies: number;
}

export interface LevelConfig {
    explosionParams: EntityObj;
    shipParams: EntityObj;
    starsParams: StarObj;
    enemyParams: EntityObj;
    enemyManagerParams: EnemyManagerParams;
    healthParams: any;
}

export interface ModelInterface {
    stage: PIXI.Container | null;
    gridSize: number;
    movement: Movement;
    level: number;
    levels: LevelConfig[];
    enemiesGrid: Record<string, Record<string, Entity>>;
    collectiblesGrid: Record<string, Record<string, Entity>>;
    shields: Record<string, ShieldObj>;
    weapons: Record<string, WeaponObj>;
    entities: Record<string, EntityObj>;
    collectibles: Record<string, CollectibleObj | Record<string, number>>;
    pools?: {
        explosion?: PoolsObj;
        bullet?: PoolsObj;
        enemy?: PoolsObj;
        coin?: PoolsObj;
        tripleCannon?: PoolsObj;
        tripleCannonSpread?: PoolsObj;
        health?: PoolsObj;
        defaultShield?: PoolsObj;
    },
    stars: Record<string, StarObj>;
    spawnProbabilities: SpawnProbabilities;
    allPools: Record<string, Pool<Entity>>;
}

export interface ScoreHolderParams {
    enemyVal: number;
    collectibleVal: number;
}



export interface BaseObj {
    assetName: string;
    ClassName?: string;
    type: string;
    grid?: Record<string, Record<string, Entity>>;
    pool?: Pool<Entity>;
    radius?: number;
}

export interface EntityObj extends BaseObj {

    speed?: number;
    value?: number;
    duration?: number;
    numStars?: number;
    acceleration?: number;
    deceleration?: number;
    cannonName?: string;
    cannonObj?: WeaponObj;

}

export interface ShieldObj extends BaseObj {
    time: number;
    speed: number;
    radius: number;
    numShields: number;
    color: PIXI.ColorSource;
}

export interface WeaponObj extends BaseObj {
    numTurrets: number;
    cannonSpacing: number;
    spreadAngle?: number;
    fireRate: number;
    bullet: string;
    time?: number;
    color?: PIXI.ColorSource;
}


export interface CollectibleObj extends BaseObj {
    value?: number;
    speed?: number;
    numLives?: number;
    time: number;
}

export interface PoolsObj {
    numElements: number;
    params: EntityObj;
}

export interface SpawnProbabilities {
    coin: number;
    tripleCannon: number;
    tripleCannonSpread: number;
    health: number;
    defaultShield: number;
}


export const Model: ModelInterface = {
    stage: null,
    gridSize: 32,
    movement: { left: false, right: false, up: false, down: false, space: false } as Movement,
    level: 0,
    levels: [],
    enemiesGrid: {},
    collectiblesGrid: {},
    allPools: {

    },
    shields: {
        defaultShield: {
            time: 5,
            speed: 30,
            radius: 80,
            numShields: 3,
            assetName: "ShieldTemplate",
            type: "shield",
            ClassName: "Shield",
            color: [0, 255, 255]
        }
    },
    stars: {
        defaultStars: {
            radius: 0.1,
            speed: 100,
            numStars: 200
        }
    },
    weapons: {

        defaultCannon: {
            numTurrets: 1,
            cannonSpacing: 10,//-- in pixels
            fireRate: 0.2, //-- in seconds,
            ClassName: "Cannon",
            bullet: "defaultBullet",
            assetName: "FireRateTemplate",
            type: "bullet"
        },
        tripleCannon: {
            numTurrets: 3,
            cannonSpacing: 10,// in pixels
            fireRate: 0.2, // in seconds,
            ClassName: "Cannon",
            bullet: "defaultBullet",
            assetName: "FireRateTemplate",
            type: "weapon",
            time: 5,
            color: [0, 255, 0]
        },
        tripleCannonSpread: {
            numTurrets: 3,
            spreadAngle: 0.3,
            fireRate: 0.1, // in seconds
            ClassName: "TripleCannonSpread",
            bullet: "defaultBullet",
            assetName: "FireAnglesTemplate",
            type: "weapon",
            time: 5,
            color: [0, 0, 255],
            cannonSpacing: 0
        }
    },
    entities: {
        defaultEnemy: {
            assetName: "Enemy1",
            ClassName: "Enemy",
            speed: 200,
            value: 5,
            type: "entity"
        },
        defaultShip: {
            assetName: "Ship1",
            speed: 300,
            acceleration: 0.03,
            deceleration: 0.05,
            type: "entity",
            cannonName: "defaultCannon"
        },
        defaultBullet: {
            assetName: "Bullet1",
            ClassName: "Bullet",
            speed: 400,
            type: "weapon"
        },
        defaultExplosion: {
            assetName: "Explosion1",
            duration: .5,
            ClassName: "Explosion",
            type: "explosion"
        }

    },
    collectibles: {
        magnet: {
            ClassName: "Collectible",
            assetName: "MagnetTemplate",
            type: "magnet",
            time: 5000
        },
        tripleCannon: {
            ClassName: "Collectible",
            assetName: "FireRateTemplate",
            type: "weapon",
            time: 5000
        },
        tripleCannonSpread: {
            ClassName: "Collectible",
            assetName: "FireAnglesTemplate",
            type: "weapon",
            time: 5000
        },
        health: {
            assetName: "HealthPackTemplate",
            numLives: 1,
            ClassName: "Collectible",
            type: "health",
            time: 5000
        },
        coin: {
            assetName: "CoinTemplate",
            ClassName: "Collectible",
            value: 10,
            speed: 10,
            type: "collectible",
            time: 5000
        },
        defaultShield: {
            assetName: "ShieldTemplate",
            ClassName: "Collectible",
            type: "shield",
            time: 5000
        }
    },
    spawnProbabilities: {
        coin: 100,
        tripleCannon: 5,
        tripleCannonSpread: 5,
        health: 1,
        defaultShield: 2
    }

};

Model.levels = [
    {
        explosionParams: Utils.deepcopy(Model.entities.defaultExplosion) as EntityObj,
        shipParams: Utils.deepcopy(Model.entities.defaultShip) as EntityObj,
        starsParams: Utils.deepcopy(Model.stars.defaultStars) as StarObj,
        enemyParams: Utils.deepcopy(Model.entities.defaultEnemy) as EntityObj,
        enemyManagerParams: {
            spawnRate: 1,
            totalEnemies: 100
        },
        healthParams: {
            numLives: 5,
            assetName: "HealthPackTemplate",
        }
    },
    {
        explosionParams: Utils.deepcopy(Model.entities.defaultExplosion) as EntityObj,
        shipParams: Utils.deepcopy(Model.entities.defaultShip) as EntityObj,
        starsParams: Utils.deepcopy(Model.stars.defaultStars) as StarObj,
        enemyParams: Utils.deepcopy(Model.entities.defaultEnemy) as EntityObj,

        enemyManagerParams: {
            spawnRate: .2,
            totalEnemies: 300
        },
        healthParams: {
            numLives: 7,
            assetName: "HealthPackTemplate",
        }
    }
];


Model.pools = {
    explosion: {
        numElements: 100,
        params: Model.entities.defaultExplosion
    },
    bullet: {
        numElements: 1000,
        params: Model.entities.defaultBullet
    },
    enemy: {
        numElements: 100,
        params: Model.entities.defaultEnemy
    }
}



