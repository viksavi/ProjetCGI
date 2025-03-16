import { Scene, Mesh, Vector3, Color3, TransformNode, SceneLoader, FreeCamera, ParticleSystem, Color4, AnimationGroup, MeshBuilder, HemisphericLight, DirectionalLight, ShadowGenerator } from "@babylonjs/core";
import { Environment } from "./environment";

export class EnvironmentScene0 extends Environment {
    constructor(scene: Scene) {
        super(scene);
    }

    public async load(): Promise<void> {
        const result = await SceneLoader.ImportMeshAsync(null, "/", "martian_world.glb", this._scene);
            if (result && result.meshes) {
                this.assets = {
                    meshes: result.meshes,
                };
            }
            this.assets.meshes.forEach((mesh) => {
                mesh.checkCollisions = true;
                mesh.showBoundingBox = true;
            });
        }
}