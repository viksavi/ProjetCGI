import { Scene, LoadAssetContainerAsync,} from "@babylonjs/core";
import { Environment } from "./environment";

export class EnvironmentScene0 extends Environment {
    constructor(scene: Scene) {
        super(scene);
    }

    public async load(): Promise<void> {
        // Chargement du monde et de l'antenne (dans le même fichier GLB)
        const container = await LoadAssetContainerAsync("/models/worlds/martian.glb", this._scene);
        container.addAllToScene();
        if (container && container.meshes) {
            this.assets = {
                meshes: container.meshes,
            };

        // Configuration des meshes de l'environnement
        this.assets.meshes.forEach((mesh) => {
            mesh.checkCollisions = true;
            if (mesh.name.toLowerCase().includes("mur")) {
                mesh.isVisible = false;
            }
        });
        }
    }
}