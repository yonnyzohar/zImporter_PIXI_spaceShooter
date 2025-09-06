import * as PIXI from 'pixi.js';

export class Healthbar extends PIXI.Container {
    private bar: PIXI.Graphics;
    private maxHealth: number;
    private currentHealth: number;

    constructor(maxHealth: number) {
        super();
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
        this.bar = new PIXI.Graphics();
        this.addChild(this.bar);
        this.drawBar();
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
    }
}
