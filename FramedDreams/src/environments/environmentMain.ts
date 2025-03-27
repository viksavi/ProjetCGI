import { Scene, Color3, LoadAssetContainerAsync, CubeTexture, MeshBuilder, StandardMaterial, Texture } from "@babylonjs/core";
import { Environment } from "./environment";

/**
 * Environnement principal du jeu (maison).
 * Charge la maison, configure les collisions et ajoute le skybox HDR.
 */
export class EnvironmentMain extends Environment {
    /**
     * Initialise l’environnement de la maison principale.
     * @param scene - Scène Babylon.js
     */
    constructor(scene: Scene) {
        super(scene);
    }

    /**
     * Charge le modèle 3D de la maison et applique le skybox d’environnement.
     */
    public async load(): Promise<void> {
        try {
            const container = await LoadAssetContainerAsync("/models/worlds/house_main.glb", this._scene);
            container.addAllToScene();
            this.assets = {
                meshes: container.meshes,
                animationGroups: container.animationGroups,
            };
            this.addEnvironmentSkyBox();
        } catch (e) {
            console.error("Error loading house environment:", e);
        }
    }

    /**
     * Active les collisions sur tous les objets sauf les murs.
     * Désactive aussi la réflexion et cache certains objets spécifiques.
     */
    public enableCollisions(): void {
        this.assets.meshes.forEach((mesh) => {
            if (mesh.name.toLowerCase().includes("wall")) { 
                mesh.checkCollisions = false; 
            } else {
                mesh.checkCollisions = true;
                if (mesh.material) {
                    mesh.material.reflectionTexture = null; 
                    mesh.material.environmentIntensity = 0; 
                }
                if (
                    mesh.name.includes("Collision") ||
                    mesh.name === "Martian_tableau" ||
                    mesh.name === "OBJ_Book"
                ) {
                    mesh.isVisible = false;
                }
            }
        });
    }

    /**
     * Ajoute un skybox HDR.
     */
    private addEnvironmentSkyBox(): void {
        const hdrTexture = new CubeTexture("/environments/blue_sky.env", this._scene); 
        this._scene.environmentTexture = hdrTexture;

        const skybox = MeshBuilder.CreateBox("skyBox", { size: 1000 }, this._scene);
        const skyboxMaterial = new StandardMaterial("skyBoxMaterial", this._scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = hdrTexture;
        skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
        skyboxMaterial.specularColor = new Color3(0, 0, 0);

        skybox.material = skyboxMaterial;
        skybox.infiniteDistance = true;
        this._scene.environmentIntensity = 0.5;
    }
}
