import { Scene, Mesh, SceneLoader, TransformNode } from "@babylonjs/core";
import { Environment } from "./environment";

export class EnvironmentScene0 extends Environment {
    constructor(scene: Scene) {
        super(scene);
    }

    public async load(): Promise<void> {
        // Chargement du monde et de l'antenne (dans le même fichier GLB)
        const result = await SceneLoader.ImportMeshAsync(null, "/models/worlds/", "martian.glb", this._scene);

        if (result && result.meshes) {
            this.assets = {
                meshes: result.meshes,
            };

        // Configuration des meshes de l'environnement
        this.assets.meshes.forEach((mesh) => {
            mesh.checkCollisions = true;
            mesh.showBoundingBox = true;
            if (mesh.name.toLowerCase().includes("mur")) {
                mesh.isVisible = false;
            }
        });
        }
    }
}