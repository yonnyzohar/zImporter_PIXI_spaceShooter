
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
    enemies: string[];
}

export interface LevelConfig {
    explosionParams: EntityObj;
    shipParams: ShipObj;
    starsParams: StarObj;
    enemyManagerParams: EnemyManagerParams;
    healthParams: any;
}

export interface MagnetObj extends BaseObj {
    time: number;
    radius: number;
    color: [number, number, number];
}


export interface ModelInterface {
    stage: PIXI.Container | null;
    gridSize: number;
    movement: Movement;
    level: number;
    levels: LevelConfig[];
    enemiesGrid: Record<string, Map<Entity, boolean>>;
    collectiblesGrid: Record<string, Map<Entity, boolean>>;
    magnets: Record<string, MagnetObj>;
    shields: Record<string, ShieldObj>;
    weapons: Record<string, WeaponObj>;
    ships: Record<string, ShipObj>;
    enemies: Record<string, EnemyObj>;
    bullets: Record<string, EntityObj>;
    explosions: Record<string, EntityObj>;
    collectibles: Record<string, CollectibleObj>;
    stars: Record<string, StarObj>;
    spawnProbabilities: Record<string, number>;

}


export interface BaseObj {
    assetName: string;
    ClassName?: string;
    type: string;
    grid?: Record<string, Map<Entity, boolean>>;
    pool?: Pool<Entity>;
    radius?: number;
    isAddedToGrid: boolean;
}

export interface EntityObj extends BaseObj {

    speed?: number;
    value?: number;
    duration?: number;
    numStars?: number;

}

export interface ShipObj extends EntityObj {
    acceleration: number;
    deceleration: number;
    cannonName: string;
    cannonObj?: WeaponObj;
}

export interface EnemyObj extends EntityObj {
    cannonName: string;
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
    fireRadius: number;
}


export interface CollectibleObj extends BaseObj {
    value?: number;
    speed?: number;
    numLives?: number;
    time: number;
}

export const Model: ModelInterface = {
    stage: null,
    gridSize: 32,
    movement: { left: false, right: false, up: false, down: false, space: false } as Movement,
    level: 0,
    levels: [],
    enemiesGrid: {},
    collectiblesGrid: {},
    magnets: {
        defaultMagnet: {
            time: 5,
            radius: 200,
            assetName: "MagnetTemplate",
            type: "magnet",
            ClassName: "Magnet",
            color: [255, 255, 0],
            isAddedToGrid: true
        }
    },
    shields: {
        defaultShield: {
            time: 5,
            speed: 100,
            radius: 120,
            numShields: 3,
            assetName: "ShieldTemplate",
            type: "shield",
            ClassName: "Shield",
            color: [0, 255, 255],
            isAddedToGrid: false
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
            fireRate: 0.1, //-- in seconds,
            ClassName: "Cannon",
            bullet: "defaultBullet",
            assetName: "Bullet9",
            type: "bullet",
            isAddedToGrid: false,
            fireRadius: -1
        },
        alienCannon: {
            numTurrets: 1,
            cannonSpacing: 10,//-- in pixels
            fireRate: 1, //-- in seconds,
            ClassName: "Cannon",
            bullet: "alienBullet",
            assetName: "FireRateTemplate",
            type: "bullet",
            isAddedToGrid: false,
            fireRadius: 600
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
            color: [0, 255, 0],
            isAddedToGrid: false,
            fireRadius: -1
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
            cannonSpacing: 0,
            isAddedToGrid: false,
            fireRadius: -1
        }
    },
    ships: {
        defaultShip: {
            assetName: "Ship1",
            speed: 300,
            acceleration: 0.06,
            deceleration: 0.05,
            type: "entity",
            cannonName: "defaultCannon",
            isAddedToGrid: true
        }
    },
    enemies: {
        enemy1: {
            assetName: "Enemy1",
            ClassName: "Enemy",
            speed: 100,
            value: 5,
            type: "entity",
            cannonName: "alienCannon",
            isAddedToGrid: true
        },
        enemy2: {
            assetName: "Enemy2",
            ClassName: "Enemy",
            speed: 80,
            value: 5,
            type: "entity",
            cannonName: "tripleCannon",
            isAddedToGrid: true
        },
        enemy3: {
            assetName: "Enemy3",
            ClassName: "Enemy",
            speed: 80,
            value: 5,
            type: "entity",
            cannonName: "alienCannon",
            isAddedToGrid: true
        },
    },
    bullets: {


        defaultBullet: {
            assetName: "Bullet1",
            ClassName: "Bullet",
            speed: 400,
            type: "weapon",
            isAddedToGrid: true
        },
        alienBullet: {
            assetName: "Bullet6",
            ClassName: "Bullet",
            speed: 150,
            type: "weapon",
            isAddedToGrid: true
        }


    },
    explosions: {
        defaultExplosion: {
            assetName: "Explosion1",
            duration: .5,
            ClassName: "Explosion",
            type: "explosion",
            isAddedToGrid: false
        }
    },
    collectibles: {
        magnet: {
            ClassName: "Collectible",
            assetName: "MagnetTemplate",
            type: "magnet",
            time: 5000,
            isAddedToGrid: true
        },
        tripleCannon: {
            ClassName: "Collectible",
            assetName: "FireRateTemplate",
            type: "weapon",
            time: 5000,
            isAddedToGrid: true
        },
        tripleCannonSpread: {
            ClassName: "Collectible",
            assetName: "FireAnglesTemplate",
            type: "weapon",
            time: 5000,
            isAddedToGrid: true
        },
        health: {
            assetName: "HealthPackTemplate",
            numLives: 1,
            ClassName: "Collectible",
            type: "health",
            time: 5000,
            isAddedToGrid: true
        },
        coin: {
            assetName: "CoinTemplate",
            ClassName: "Collectible",
            value: 10,
            speed: 10,
            type: "collectible",
            time: 5000,
            isAddedToGrid: true
        },
        defaultShield: {
            assetName: "ShieldTemplate",
            ClassName: "Collectible",
            type: "shield",
            time: 5000,
            isAddedToGrid: true
        },
        defaultMagnet: {
            assetName: "MagnetTemplate",
            ClassName: "Collectible",
            type: "magnet",
            time: 5000,
            isAddedToGrid: true
        }
    },
    spawnProbabilities: {
        coin: 1,
        tripleCannon: 1,
        tripleCannonSpread: 1,
        health: 1,
        defaultShield: 1,
        defaultMagnet: 1
    }

};

Model.levels = [
    {
        explosionParams: Utils.deepcopy(Model.explosions.defaultExplosion) as EntityObj,
        shipParams: Utils.deepcopy(Model.ships.defaultShip) as ShipObj,
        starsParams: Utils.deepcopy(Model.stars.defaultStars) as StarObj,
        enemyManagerParams: {
            spawnRate: .5,
            totalEnemies: 100,
            enemies: ["enemy1", "enemy2", "enemy3"]

        },
        healthParams: {
            numLives: 5,
            assetName: "HealthPackTemplate",
        }
    },
    {
        explosionParams: Utils.deepcopy(Model.explosions.defaultExplosion) as EntityObj,
        shipParams: Utils.deepcopy(Model.ships.defaultShip) as ShipObj,
        starsParams: Utils.deepcopy(Model.stars.defaultStars) as StarObj,

        enemyManagerParams: {
            spawnRate: .2,
            totalEnemies: 300,
            enemies: ["enemy1"]
        },
        healthParams: {
            numLives: 7,
            assetName: "HealthPackTemplate",
        }
    }
];



