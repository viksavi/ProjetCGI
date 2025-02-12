import { Scene, Mesh, Vector3, Color3, TransformNode, SceneLoader, ParticleSystem, Color4, AnimationGroup, MeshBuilder } from "@babylonjs/core";
import { Environment } from "./environment";

export class EnvironmentMain extends Environment {
    constructor(scene: Scene) {
        super(scene);
    }

    public async load(): Promise<void> {
        try {
            const result = await SceneLoader.ImportMeshAsync(null, "/", "kitchen_house.glb", this._scene);
            this.assets = {
                meshes: result.meshes,
                animationGroups: result.animationGroups,
            };
        } catch (e) {
            console.error("Error loading house environment:", e);
        }
    }
}