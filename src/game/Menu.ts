import * as PIXI from 'pixi.js';

export class Menu {
    public container: PIXI.Container;
    private app: PIXI.Application;

    constructor(app: PIXI.Application) {
        this.app = app;
        this.container = new PIXI.Container();
        // Add menu graphics here, e.g. title text
        const title = new PIXI.Text('Game Menu', { fontFamily: 'Arial', fontSize: 48, fill: 0xffffff });
        title.anchor.set(0.5);
        title.x = app.screen.width / 2;
        title.y = app.screen.height / 2;
        this.container.addChild(title);
    }

    update(_dt: number) {
        // Menu update logic if needed
    }

    draw() {
        // Drawing handled by PixiJS
    }

    destroy() {
        this.container.destroy({ children: true });
    }
}
