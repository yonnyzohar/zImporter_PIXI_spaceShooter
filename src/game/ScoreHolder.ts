import { EventsManager } from "../core/EventsManager";
import { Model, ScoreHolderParams } from "./Model";
import * as PIXI from 'pixi.js';



export class ScoreHolder {
    private score: number = 0;
    private enemyVal: number;
    private collectibleVal: number;
    private view: PIXI.Text = new PIXI.Text('');

    constructor(params: ScoreHolderParams) {
        this.enemyVal = params.enemyVal;
        this.collectibleVal = params.collectibleVal;
        EventsManager.addListener("COIN_COLLECTED", this.onCoinCollected);
        EventsManager.addListener("ENEMY_DESTROYED", this.onEnemyDestroyed);
        Model.stage?.addChild(this.view);
        this.view.style = new PIXI.TextStyle({
            fill: '#ffffff',
            fontSize: 14,
        });
        this.view.x = Model.stageWidth! - 100;
        this.view.y = 10;
        this.view.text = `Score : ${this.score}`;
    }

    destroy() {
        EventsManager.removeListener("COIN_COLLECTED", this.onCoinCollected);
        EventsManager.removeListener("ENEMY_DESTROYED", this.onEnemyDestroyed);
    }

    private onEnemyDestroyed = () => {
        this.score += this.enemyVal;
        this.view.text = `Score : ${this.score}`;
    };

    private onCoinCollected = () => {
        this.score += this.collectibleVal;
        this.view.text = `Score : ${this.score}`;
    };


}