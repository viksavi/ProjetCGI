var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { LoadAssetContainerAsync, } from "@babylonjs/core";
import { Environment } from "./environment";
export class EnvironmentScene0 extends Environment {
    constructor(scene) {
        super(scene);
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            const container = yield LoadAssetContainerAsync("/models/worlds/martian.glb", this._scene);
            container.addAllToScene();
            if (container && container.meshes) {
                this.assets = {
                    meshes: container.meshes,
                };
                this.assets.meshes.forEach((mesh) => {
                    mesh.checkCollisions = true;
                    if (mesh.name.toLowerCase().includes("mur") || mesh.name.toLowerCase().includes("laser") || mesh.name === "gate_light") {
                        mesh.isVisible = false;
                    }
                });
            }
        });
    }
    dispose() {
        if (this.assets && this.assets.environmentLight) {
            this.assets.environmentLight.dispose();
        }
        if (this.assets && this.assets.skyTexture) {
            this.assets.skyTexture.dispose();
        }
    }
}
