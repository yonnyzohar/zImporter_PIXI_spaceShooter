// TimerService.ts
import * as PIXI from 'pixi.js';
import { Updatables } from './../core/Updatables';
import { ZScene } from 'zimporter-pixi';
import { Model } from '../game';

export class TimersManager {
    private timers: Map<string, TimerService> = new Map();
    addTime(timerId: string, time: number, color: PIXI.ColorSource, completeCallback: Function) {

        if (this.timers.has(timerId)) {
            this.timers.get(timerId)!.destroy();
            this.timers.delete(timerId);
            this.reorganizeTimers();
        }
        const timer = new TimerService();
        timer.start(time, color, completeCallback, () => {
            this.timers.delete(timerId);
            this.reorganizeTimers();
        });
        this.timers.set(timerId, timer);
        this.reorganizeTimers();
    }

    reorganizeTimers() {
        let index = 0;
        let scene: ZScene = ZScene.getSceneById("game-scene")!;
        let dimensions = scene.getInnerDimensions();
        this.timers.forEach((timer) => {

            timer.rect.y = dimensions.height - 30 - (30 * index);
            index++;
        });
    }
}

export class TimerService {
    private time: number = 0;
    private startTime: number = 0;
    private selfRef: any;
    private completeCallback?: Function;
    public rect: PIXI.Graphics = new PIXI.Graphics();
    private scene: ZScene = ZScene.getSceneById("game-scene")!;
    private stopCallback?: Function;

    start(
        time: number,
        color: PIXI.ColorSource,
        completeCallback: Function,
        stopCallback?: Function
    ) {
        this.time = time;
        this.startTime = 0;
        this.stopCallback = stopCallback;
        let dimensions = this.scene.getInnerDimensions();
        this.completeCallback = completeCallback;
        this.rect.beginFill(color);
        this.rect.drawRect(0, 0, dimensions.width, 30);
        this.rect.endFill();
        Model.stage!.addChild(this.rect);
        this.stop();
        Updatables.add(this);
    }

    update(dt: number) {
        this.startTime += dt;
        let per = this.startTime / this.time;
        let dimensions = this.scene.getInnerDimensions();
        this.rect.width = dimensions.width * per;

        if (this.startTime >= this.time) {

            if (this.completeCallback) {
                this.completeCallback();
            }
            this.destroy();
        }
    }

    destroy() {
        Updatables.remove(this);
        this.rect.clear();
        Model.stage!.removeChild(this.rect);
        this.stopCallback?.();
    }

    stop() {
        Updatables.remove(this);
    }
}