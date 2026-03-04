import { Entity } from "./Entity";

export class Updatables {
    private static updatables: Map<{ update: (dt: number) => void }, boolean> = new Map();

    static add(updatable: { update: (dt: number) => void }) {
        this.updatables.set(updatable, true);
    }

    static remove(updatable: { update: (dt: number) => void }) {
        this.updatables.delete(updatable);
    }

    static update(dt: number) {
        for (const [u] of this.updatables) {
            u.update(dt);
        }
    }

    static clear() {
        this.updatables.clear();
    }

    static clearWithCleanup() {
        for (const [u] of this.updatables) {
            const entity = u as unknown as Entity;
            if (entity.asset && entity.asset.parent) {
                entity.asset.parent.removeChild(entity.asset);
            }
            if (entity.circle && entity.circle.parent) {
                entity.circle.parent.removeChild(entity.circle);
            }
        }
        this.updatables.clear();
    }
}
