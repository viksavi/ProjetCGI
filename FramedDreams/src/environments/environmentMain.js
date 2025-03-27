var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Color3, LoadAssetContainerAsync, CubeTexture, MeshBuilder, StandardMaterial, Texture } from "@babylonjs/core";
import { Environment } from "./environment";
export class EnvironmentMain extends Environment {
    constructor(scene) {
        super(scene);
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const container = yield LoadAssetContainerAsync("/models/worlds/house_main.glb", this._scene);
                container.addAllToScene();
                this.assets = {
                    meshes: container.meshes,
                    animationGroups: container.animationGroups,
                };
                this.addEnvironmentSkyBox();
            }
            catch (e) {
                console.error("Error loading house environment:", e);
            }
        });
    }
    enableCollisions() {
        this.assets.meshes.forEach((mesh) => {
            if (mesh.name.toLowerCase().includes("wall")) {
                mesh.checkCollisions = false;
            }
            else {
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
    addEnvironmentSkyBox() {
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
