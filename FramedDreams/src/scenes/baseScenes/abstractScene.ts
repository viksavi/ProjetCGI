import { Scene, Engine } from "@babylonjs/core";
import { AdvancedDynamicTexture } from "@babylonjs/gui";

export abstract class AbstractScene {
    protected _scene: Scene;
    protected _engine: Engine;
    public ui: AdvancedDynamicTexture;

    constructor(engine: Engine) {
        this._engine = engine;
        this._scene = new Scene(engine);
        this.ui = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    }

    public getScene(): Scene {
        return this._scene;
    }

    public abstract load(): Promise<any>;

    public abstract dispose(): void;
}