import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine }  from "@babylonjs/core";
import { AbstractScene } from "./scenes/baseScenes/abstractScene";
import { StartScene } from "./scenes/scenesUI/startScene";
import { CutScene } from "./scenes/scenesUI/cutScene";
import { MainScene } from "./scenes/gameScenes/mainScene";
import { Scene0 } from "./scenes/gameScenes/scene_0";

enum State {START = 0, CUT_SCENE = 1, MAIN_SCENE = 2, SCENE_0 = 3}

class App {
    
    private _scene: AbstractScene;
    private _canvas: HTMLCanvasElement;
    private _engine: Engine;

    private _inputMap: {};

    private _state: number = 0;

    private _mainScenePromise: Promise<MainScene>;

    constructor() {
        this._canvas = this._createCanvas();
        this._engine = new Engine(this._canvas, true);
        this._inputMap = {};

        // hide/show the Inspector
        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey) {
                if (this._scene.getScene().debugLayer.isVisible()) {
                    this._scene.getScene().debugLayer.hide();
                } else {
                    this._scene.getScene().debugLayer.show();
                }
            }

            this._inputMap[ev.code] = ev.type == "keydown"; 
        });

        window.addEventListener("keyup", (ev) => {
            // Store the state of the input.
            this._inputMap[ev.code] = ev.type == "keydown"; // Store key state (pressed or released)
        });

        // run the main render loop
        this._main();
    }

    private async _main(): Promise<void> {
        await this._goToStart();
    
        // Register a render loop to repeatedly render the scene
        this._engine.runRenderLoop(() => {
            if (this._scene) {
                this._scene.getScene().render();
            }
        });
    
        //resize if the screen is resized/rotated
        window.addEventListener('resize', () => {
            this._engine.resize();
        });
    }

    private _createCanvas(): HTMLCanvasElement {

        //Commented out for development
        document.documentElement.style["overflow"] = "hidden";
        document.documentElement.style.overflow = "hidden";
        document.documentElement.style.width = "100%";
        document.documentElement.style.height = "100%";
        document.documentElement.style.margin = "0";
        document.documentElement.style.padding = "0";
        document.body.style.overflow = "hidden";
        document.body.style.width = "100%";
        document.body.style.height = "100%";
        document.body.style.margin = "0";
        document.body.style.padding = "0";

        //create the canvas html element and attach it to the webpage
        this._canvas = document.createElement("canvas");
        this._canvas.style.width = "100%";
        this._canvas.style.height = "100%";
        this._canvas.id = "gameCanvas";
        document.body.appendChild(this._canvas);

        return this._canvas;
    }

    private async _goToStart() {
        this._engine.displayLoadingUI();

        if (this._scene) {
            this._scene.dispose();
        }

        const startScene = new StartScene(this._engine, () => this._goToCutScene());
        this._scene = startScene;
        await startScene.load();
        this._state = State.START;

        this._engine.hideLoadingUI();
    }

    private async _goToCutScene(): Promise<void> {
        this._engine.displayLoadingUI();

        if (this._scene) {
            this._scene.dispose();
        }

        const cutScene = new CutScene(this._engine, () => this._goToMainScene());
        this._scene = cutScene;
        await cutScene.load();
        this._state = State.CUT_SCENE;

        this._mainScenePromise = this._loadMainScene();
        await this._mainScenePromise;

        this._engine.hideLoadingUI();
    }

    private async _loadMainScene(): Promise<MainScene> {

        const mainScene = new MainScene(this._engine, () => this._goToScene0(), this._canvas);
        await mainScene.load();
        return mainScene;
    }

    private async _goToMainScene(): Promise<void> {

        this._engine.displayLoadingUI();

        if (this._scene) {
            this._scene.dispose();
        }

        this._scene = await this._mainScenePromise;
        this._state = State.MAIN_SCENE;
        this._engine.hideLoadingUI();
    }

    private async _goToScene0(): Promise<void> {
        if (this._state === State.MAIN_SCENE && (this._scene as MainScene).player && (this._scene as MainScene).player.mesh) {
            const mainScene = this._scene as MainScene;
        }

        this._engine.displayLoadingUI();
        await Promise.resolve();

        if (this._scene) {
            this._scene.dispose();
        }

        const scene0 = new Scene0(this._engine);
        this._scene = scene0;
        await scene0.load();
        this._state = State.SCENE_0;

        this._engine.hideLoadingUI();
    }


}
new App();