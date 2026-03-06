import { ZContainer } from 'zimporter-pixi';
import { Model } from './Model';
import { EventsManager } from '../core/EventsManager';

/**
 * Uses the scene's "keypad" asset (containing upBTN, leftBTN, downBTN, rightBTN)
 * to control the ship on touch devices. On non-mobile devices the keypad is hidden.
 */
export class MobileControls {

    /** Returns true if the device is touch-capable. */
    static isMobile(): boolean {
        return (
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0
        );
    }

    constructor() {
        const keypad = Model.stage?.get('keypad') as ZContainer | undefined;
        if (!keypad) return;

        if (!MobileControls.isMobile()) {
            keypad.visible = false;
            return;
        }

        keypad.visible = true;

        // Prevent the browser long-press "Save Image" / context menu on the canvas
        const canvas = document.querySelector('canvas');
        if (canvas) {
            canvas.addEventListener('contextmenu', (e) => e.preventDefault());
            (canvas.style as any).webkitTouchCallout = 'none';
            canvas.style.userSelect = 'none';
            (canvas.style as any).webkitUserSelect = 'none';
        }

        const bindBtn = (btnName: string, key: keyof typeof Model.movement) => {
            const btn = keypad.get(btnName) as ZContainer | undefined;
            if (!btn) return;

            (btn as any).eventMode = 'static';
            (btn as any).cursor = 'pointer';

            btn.on('pointerdown', () => {
                (Model.movement as any)[key] = true;
                if (key === 'space') EventsManager.emit('MENU_SPACE_PRESSED');
            });
            btn.on('pointerup',        () => { (Model.movement as any)[key] = false; });
            btn.on('pointerupoutside', () => { (Model.movement as any)[key] = false; });
            btn.on('pointercancel',    () => { (Model.movement as any)[key] = false; });
        };

        bindBtn('upBTN',    'up');
        bindBtn('leftBTN',  'left');
        bindBtn('downBTN',  'down');
        bindBtn('rightBTN', 'right');
    }
}
