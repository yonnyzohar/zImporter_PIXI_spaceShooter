// TimerService.ts

import { Updatables } from './../core/Updatables';

export class TimerService {
    private time: number = 0;
    private startTime: number = 0;
    private selfRef: any;
    private completeCallback?: Function;
    private updateCallback?: Function;

    start(
        time: number,
        completeCallback: Function,
        updateCallback?: Function
    ) {
        this.time = time;
        this.startTime = 0;
        this.completeCallback = completeCallback;
        this.updateCallback = updateCallback;
        this.stop();
        Updatables.add(this);
    }

    update(dt: number) {
        this.startTime += dt;
        if (this.updateCallback) {
            this.updateCallback(this.startTime / this.time);
        }
        if (this.startTime >= this.time) {
            Updatables.remove(this);
            if (this.completeCallback) {
                this.completeCallback();
            }
        }
    }

    stop() {
        Updatables.remove(this);
    }
}