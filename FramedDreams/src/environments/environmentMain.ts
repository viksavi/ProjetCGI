import { Scene, Mesh, Vector3, Color3, TransformNode, SceneLoader, ParticleSystem, Color4, AnimationGroup, MeshBuilder, HDRCubeTexture, StandardMaterial, Texture } from "@babylonjs/core";
import { Environment } from "./environment";

export class EnvironmentMain extends Environment {
    constructor(scene: Scene) {
        super(scene);
    }

    public async load(): Promise<void> {
        try {
            const result = await SceneLoader.ImportMeshAsync(null, "/", "house_main.glb", this._scene);
            this.assets = {
                meshes: result.meshes,
                animationGroups: result.animationGroups,
            };
            this.addEnvironemntSkyBox();
        } catch (e) {
            console.error("Error loading house environment:", e);
        }
    }

    public enableCollisions(): void {
        this.assets.meshes.forEach((mesh) => {
            if (!mesh.name.toLowerCase().includes("door")) { 
                mesh.checkCollisions = true;
                if(mesh.material) {
                    mesh.material.reflectionTexture = null; 
                    mesh.material.environmentIntensity = 0; 
                }
            }
        });
    }

    private addEnvironemntSkyBox(): void {
        const hdrTexture = new HDRCubeTexture("/meadow_2_2k.hdr", this._scene, 512);
    	this._scene.environmentTexture = hdrTexture;
        const skybox = MeshBuilder.CreateBox("skyBox", { size: 1000 }, this._scene);
        const skyboxMaterial = new StandardMaterial("skyBoxMaterial", this._scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = hdrTexture;
        skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
        skyboxMaterial.specularColor = new Color3(0, 0, 0);
        skybox.material = skyboxMaterial;
        this._scene.environmentIntensity = 0.1;
    }
    
}