import { Scene, Color3, LoadAssetContainerAsync, CubeTexture, MeshBuilder, StandardMaterial, Texture } from "@babylonjs/core";
import { Environment } from "./environment";

export class EnvironmentMain extends Environment {
    constructor(scene: Scene) {
        super(scene);
    }

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
                if (mesh.name.includes("Collision") || mesh.name === "Martian_tableau" || mesh.name === "OBJ_Book") {
                    mesh.isVisible = false;
                }
            }
        });
        
    }

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