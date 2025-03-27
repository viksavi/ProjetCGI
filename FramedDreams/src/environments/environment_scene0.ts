import { Scene, LoadAssetContainerAsync,} from "@babylonjs/core";
import { Environment } from "./environment";

/**
 * Environnement spécifique à la scène 0 (Mars).
 * Charge le monde martien et configure les collisions et la visibilité des objets.
 */
export class EnvironmentScene0 extends Environment {
    /**
     * Initialise l’environnement martien pour la scène.
     * @param scene - Scène Babylon.js
     */
    constructor(scene: Scene) {
        super(scene);
    }

    /**
     * Charge l’environnement martien depuis un fichier GLB et configure les meshes.
     */
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
                if (
                    mesh.name.toLowerCase().includes("mur") ||
                    mesh.name.toLowerCase().includes("laser") ||
                    mesh.name === "gate_light"
                ) {
                    mesh.isVisible = false;
                }
            });
        }
    }

    /**
     * Détruit les ressources spécifiques à l’environnement si elles existent.
     */
    public dispose(): void {
        if (this.assets && this.assets.environmentLight) {
            this.assets.environmentLight.dispose();
        }
        if (this.assets && this.assets.skyTexture) {
            this.assets.skyTexture.dispose();
        }
    }
}
