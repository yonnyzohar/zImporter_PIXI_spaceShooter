import { ZScene } from "zimporter-pixi/dist/ZScene";
import { EventsManager } from "../core/EventsManager";
import { Model } from "./Model";
import * as PIXI from 'pixi.js';



export class ScoreHolder {
    private score: number = 0;
    private view: PIXI.Text = new PIXI.Text('');

    constructor() {
        let scene: ZScene = ZScene.getSceneById("game-scene")!;
        let dimensions = scene.getInnerDimensions();
        EventsManager.addListener("COIN_COLLECTED", this.onCoinCollected);

        Model.stage?.addChild(this.view);
        this.view.style = new PIXI.TextStyle({
            fill: '#ffffff',
            fontSize: 14,
        });
        this.view.x = dimensions.width - 100;
        this.view.y = 10;
        this.view.text = `Score : ${this.score}`;
    }

    destroy() {
        EventsManager.removeListener("COIN_COLLECTED", this.onCoinCollected);
    }

    private onEnemyDestroyed = (enemyVal: number = 0) => {
        this.score += enemyVal;
        this.view.text = `Score : ${this.score}`;
    };

    private onCoinCollected = (collectibleVal: number = 0) => {
        this.score += collectibleVal;
        this.view.text = `Score : ${this.score}`;
    };


}