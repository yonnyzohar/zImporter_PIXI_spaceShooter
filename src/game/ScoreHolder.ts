import { ZScene } from "zimporter-pixi/dist/ZScene";
import { EventsManager } from "../core/EventsManager";
import { Model } from "./Model";
import * as PIXI from 'pixi.js';
import { ZContainer } from "zimporter-pixi";



export class ScoreHolder {
    private score: number = 0;
    private view: PIXI.Text = new PIXI.Text('');

    constructor() {
        let scene: ZScene = ZScene.getSceneById("game-scene")!;
        let dimensions = scene.getInnerDimensions();
        EventsManager.addListener("COIN_COLLECTED", this.onCoinCollected);
        EventsManager.addListener("ENEMY_DESTROYED", this.onEnemyDestroyed);
        let scoreContainer = Model.stage?.get("scoreContainer")!;
        let scoreInner = scoreContainer.get("scoreInner") as ZContainer;

        scoreInner.setText(`Score : ${this.score}`);
    }

    destroy() {
        EventsManager.removeListener("COIN_COLLECTED", this.onCoinCollected);
        EventsManager.removeListener("ENEMY_DESTROYED", this.onEnemyDestroyed);
    }

    private onEnemyDestroyed = (data: { x: number; y: number; value: number }) => {
        this.score += data?.value || 0;
        let scoreContainer = Model.stage?.get("scoreContainer")!;
        let scoreInner = scoreContainer.get("scoreInner") as ZContainer;
        scoreInner.setText(`Score : ${this.score}`);
    };

    private onCoinCollected = (collectibleVal: number = 0) => {
        this.score += collectibleVal;
        let scoreContainer = Model.stage?.get("scoreContainer")!;
        let scoreInner = scoreContainer.get("scoreInner") as ZContainer;
        scoreInner.setText(`Score : ${this.score}`);
    };


}