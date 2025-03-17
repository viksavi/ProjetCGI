import { Scene, Mesh, Vector3, Color3, BoundingInfo, TransformNode, CubeTexture, PhysicsImpostor, SceneLoader, ParticleSystem, Color4, AnimationGroup, MeshBuilder, HDRCubeTexture, StandardMaterial, Texture } from "@babylonjs/core";
import { Environment } from "./environment";

export class EnvironmentMain extends Environment {
    constructor(scene: Scene) {
        super(scene);
    }

    public async load(): Promise<void> {
        try {
            const result = await SceneLoader.ImportMeshAsync(null, "/models/worlds/", "house_main.glb", this._scene);
            this.assets = {
                meshes: result.meshes,
                animationGroups: result.animationGroups,
            };
            this.addEnvironmentSkyBox();
        } catch (e) {
            console.error("Error loading house environment:", e);
        }
    }



    public enableCollisions(): void {
        this.assets.meshes.forEach((mesh) => {
            if (mesh.name.toLowerCase().includes("wall") || mesh.name === "OBJ_Stairs_02") { 
                mesh.checkCollisions = false; 
            } else {
                mesh.checkCollisions = true;
                if (mesh.material) {
                    mesh.material.reflectionTexture = null; 
                    mesh.material.environmentIntensity = 0; 
                }
                if (mesh.name.includes("Collision") || mesh.name === "Martian_tableau") {
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