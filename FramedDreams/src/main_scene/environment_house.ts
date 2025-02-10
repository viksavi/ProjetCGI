import { Scene, Mesh, Vector3, Color3, TransformNode, SceneLoader, ParticleSystem, Color4, AnimationGroup, MeshBuilder } from "@babylonjs/core";

export class EnvironmentMain {
    private _scene: Scene;

    constructor(scene: Scene) {
        this._scene = scene;
    }

    public async load() {
        const assets = await SceneLoader.ImportMeshAsync("", "/", "kitchen_house.glb", this._scene);
    }
}