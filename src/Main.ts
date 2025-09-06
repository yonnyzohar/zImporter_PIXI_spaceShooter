import * as PIXI from 'pixi.js';
import { Model } from './game/Model';
import { Menu } from './game/Menu';
import { Game } from './game/Game';
import { EventsManager } from './core/EventsManager';
import { ZScene } from 'zimporter-pixi/dist/ZScene';
import { ZSceneStack } from 'zimporter-pixi/dist/ZSceneStack';
import { ZContainer } from 'zimporter-pixi/dist/ZContainer';

const LEFT_KEY = 'ArrowLeft';
const RIGHT_KEY = 'ArrowRight';
const UP_KEY = 'ArrowUp';
const DOWN_KEY = 'ArrowDown';
export class Main {

    private game: Game;


    constructor(appStage: PIXI.Container, resizeCanvas: () => void) {


        let loadPath = (window as any).loadPath || "./scene/";
        console.log("Game constructor " + loadPath);
        let scene: ZScene = new ZScene("game-scene");
        scene.load(loadPath, () => {
            ZSceneStack.push(scene);
            let stage = scene.sceneStage;
            Model.stage = stage;
            let dimensions = scene.getInnerDimensions();
            Model.stageWidth! = dimensions.width;
            Model.stageHeight! = dimensions.height;
            resizeCanvas?.();
            this.game = new Game();
            appStage.addChild(stage);

        });
        //EventsManager.addListener('MENU_SPACE_PRESSED', game, onMenuSpacePressed);

        //EventsManager.addListener('GAME_OVER', game, onGameOver);



        window.addEventListener('keydown', (e) => {
            switch (e.key) {
                case LEFT_KEY:
                    Model.movement.left = true;
                    break;
                case RIGHT_KEY:
                    Model.movement.right = true;
                    break;
                case UP_KEY:
                    Model.movement.up = true;
                    break;
                case DOWN_KEY:
                    Model.movement.down = true;
                    break;
                case ' ':
                case 'Spacebar':
                    Model.movement.space = true;
                    EventsManager.emit('MENU_SPACE_PRESSED');
                    break;
            }
        });

        window.addEventListener('keyup', (e) => {
            switch (e.key) {
                case LEFT_KEY:
                    Model.movement.left = false;
                    break;
                case RIGHT_KEY:
                    Model.movement.right = false;
                    break;
                case UP_KEY:
                    Model.movement.up = false;
                    break;
                case DOWN_KEY:
                    Model.movement.down = false;
                    break;
                case ' ':
                case 'Spacebar':
                    Model.movement.space = false;
                    break;
            }
        });
    }



    onGameOver(_caller: any, winObj: { win: boolean }) {
        if (winObj.win) {
            Model.level = Model.level + 1;
            if (!Model.levels[Model.level]) {
                Model.level = 1;
            }
        }
        //this.game.onGameOver(loadMenu, winObj.win);
    }

    update(dt: number) {
        if (this.game) {
            this.game.update(dt);
        }
    }
}











