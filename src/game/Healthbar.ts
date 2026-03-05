import * as PIXI from 'pixi.js';
import { Model } from './Model';

export class Healthbar extends PIXI.Container {
    private bar: PIXI.Graphics;
    private maxHealth: number;
    private currentHealth: number;

    constructor(params: { numLives: number }) {
        super();
        this.maxHealth = params.numLives;
        this.currentHealth = params.numLives;
        this.bar = new PIXI.Graphics();
        this.addChild(this.bar);
        this.drawBar();
    }

    damage(amount: number = 1) {
        this.currentHealth = Math.max(0, this.currentHealth - amount);
        this.drawBar();
    }

    heal(amount: number = 1) {
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
        this.drawBar();
    }

    isDead(): boolean {
        return this.currentHealth <= 0;
    }

    setHealth(health: number) {
        this.currentHealth = health;
        this.drawBar();
    }

    private drawBar() {
        this.bar.clear();
        this.bar.beginFill(0xff0000);
        this.bar.drawRect(0, 0, 100, 10);
        this.bar.endFill();
        this.bar.beginFill(0x00ff00);
        this.bar.drawRect(0, 0, 100 * (this.currentHealth / this.maxHealth), 10);
        this.bar.endFill();
        let livesContainer = Model.stage?.get("livesContainer")!;
        livesContainer.addChild(this);
    }
}
