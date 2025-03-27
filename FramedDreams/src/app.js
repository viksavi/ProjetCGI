var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine } from "@babylonjs/core";
import { StartScene } from "./scenes/scenesUI/startScene";
import { CutScene } from "./scenes/scenesUI/cutScene";
import { MainScene } from "./scenes/gameScenes/mainScene";
import { Scene0 } from "./scenes/gameScenes/scene_0";
var State;
(function (State) {
    State[State["START"] = 0] = "START";
    State[State["CUT_SCENE"] = 1] = "CUT_SCENE";
    State[State["MAIN_SCENE"] = 2] = "MAIN_SCENE";
    State[State["SCENE_0"] = 3] = "SCENE_0";
})(State || (State = {}));
class App {
    constructor() {
        Object.defineProperty(this, "_scene", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_canvas", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_engine", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_inputMap", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_state", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "_startScene", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_cutScene", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_mainScene", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_scene0", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_marsVisited", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        this._canvas = this._createCanvas();
        this._engine = new Engine(this._canvas, true);
        this._inputMap = {};
        window.addEventListener("keydown", (ev) => {
            if (ev.shiftKey && ev.ctrlKey && ev.altKey) {
                if (this._scene.getScene().debugLayer.isVisible()) {
                    this._scene.getScene().debugLayer.hide();
                }
                else {
                    this._scene.getScene().debugLayer.show();
                }
            }
            this._inputMap[ev.code] = ev.type == "keydown";
        });
        window.addEventListener("keyup", (ev) => {
            this._inputMap[ev.code] = ev.type == "keydown";
        });
        this._main();
    }
    _main() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._goToStart();
            this._engine.runRenderLoop(() => {
                if (this._scene) {
                    this._scene.getScene().render();
                }
            });
            window.addEventListener('resize', () => {
                this._engine.resize();
            });
        });
    }
    _createCanvas() {
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
        this._canvas = document.createElement("canvas");
        this._canvas.style.width = "100%";
        this._canvas.style.height = "100%";
        this._canvas.id = "gameCanvas";
        document.body.appendChild(this._canvas);
        return this._canvas;
    }
    _goToStart() {
        return __awaiter(this, void 0, void 0, function* () {
            this._engine.displayLoadingUI();
            if (this._scene) {
                this._scene.dispose();
            }
            this._startScene = new StartScene(this._engine, () => this._goToCutScene());
            this._scene = this._startScene;
            yield this._startScene.load();
            this._state = State.START;
            this._engine.hideLoadingUI();
        });
    }
    _goToCutScene() {
        return __awaiter(this, void 0, void 0, function* () {
            this._engine.displayLoadingUI();
            if (this._scene) {
                this._scene.dispose();
            }
            this._cutScene = new CutScene(this._engine, () => this._goToMainScene());
            this._scene = this._cutScene;
            yield this._cutScene.load();
            this._state = State.CUT_SCENE;
            this._mainScene = yield this._loadMainScene();
            this._engine.hideLoadingUI();
        });
    }
    _loadMainScene() {
        return __awaiter(this, void 0, void 0, function* () {
            const mainScene = new MainScene(this._engine, () => this._goToScene0(), this._canvas, this._marsVisited);
            yield mainScene.load();
            console.log("Main Scene loaded");
            return mainScene;
        });
    }
    _goToMainScene() {
        return __awaiter(this, void 0, void 0, function* () {
            yield new Promise(resolve => setTimeout(resolve, 500));
            this._engine.displayLoadingUI();
            if (this._scene) {
                this._scene.dispose();
            }
            if (this._state === State.SCENE_0) {
                this._marsVisited = true;
                this._mainScene = yield this._loadMainScene();
            }
            this._scene = this._mainScene;
            this._state = State.MAIN_SCENE;
            this._engine.hideLoadingUI();
            if (this._marsVisited) {
                this._mainScene.showBook();
            }
        });
    }
    _goToScene0() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._state === State.MAIN_SCENE && this._scene.player && this._scene.player.mesh) {
                const mainScene = this._scene;
            }
            this._engine.displayLoadingUI();
            yield Promise.resolve();
            if (this._scene) {
                this._scene.dispose();
            }
            this._scene0 = new Scene0(this._engine, () => this._goToMainScene());
            this._scene = this._scene0;
            yield this._scene0.load();
            this._state = State.SCENE_0;
            this._engine.hideLoadingUI();
        });
    }
}
new App();
