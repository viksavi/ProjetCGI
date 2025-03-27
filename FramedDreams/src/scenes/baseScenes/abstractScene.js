import { Scene } from "@babylonjs/core";
import { AdvancedDynamicTexture } from "@babylonjs/gui";
export class AbstractScene {
    constructor(engine) {
        Object.defineProperty(this, "_scene", {
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
        Object.defineProperty(this, "ui", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this._engine = engine;
        this._scene = new Scene(engine);
        this.ui = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    }
    getScene() {
        return this._scene;
    }
}
