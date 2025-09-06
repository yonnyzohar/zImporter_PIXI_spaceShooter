import { Updatables } from "../core/Updatables";

type Callback = (selfRef: any) => void;

export class WeaponTimerService {
    private time: number = 0;
    private startTime: number = 0;
    private selfRef: any;
    private callback?: Callback;

    start(time: number, selfRef: any, callback: Callback) {
        this.time = time;
        this.startTime = 0;
        this.selfRef = selfRef;
        this.callback = callback;
        Updatables.add(this);
    }

    update(dt: number) {
        this.startTime += dt;
        if (this.startTime >= this.time) {
            Updatables.remove(this);
            if (this.callback) {
                this.callback(this.selfRef);
            }
        }
    }

    stop() {
        Updatables.remove(this);
    }
}