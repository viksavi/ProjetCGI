import { Scene } from "@babylonjs/core";

export abstract class Environment {
    protected _scene: Scene;
    public assets: any; 

    constructor(scene: Scene) {
        this._scene = scene;
    }

    public abstract load(): Promise<void>;
}