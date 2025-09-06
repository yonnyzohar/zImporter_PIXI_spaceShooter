// TimerService.ts

import { Updatables } from './../core/Updatables';
type Callback = (selfRef: any, progress?: number) => void;

export class TimerService {
    private time: number = 0;
    private startTime: number = 0;
    private selfRef: any;
    private completeCallback?: Callback;
    private updateCallback?: Callback;

    start(
        time: number,
        selfRef: any,
        completeCallback: Callback,
        updateCallback?: Callback
    ) {
        this.time = time;
        this.startTime = 0;
        this.selfRef = selfRef;
        this.completeCallback = completeCallback;
        this.updateCallback = updateCallback;
        this.stop();
        Updatables.add(this);
    }

    update(dt: number) {
        this.startTime += dt;
        if (this.updateCallback) {
            this.updateCallback(this.selfRef, this.startTime / this.time);
        }
        if (this.startTime >= this.time) {
            Updatables.remove(this);
            if (this.completeCallback) {
                this.completeCallback(this.selfRef);
            }
        }
    }

    stop() {
        Updatables.remove(this);
    }
}