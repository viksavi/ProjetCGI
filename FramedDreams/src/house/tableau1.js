import { Color3, GlowLayer, StandardMaterial, Texture } from "@babylonjs/core";
export class Tableau1 {
    constructor(scene) {
        Object.defineProperty(this, "_scene", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_tableau1", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_tableauBack", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_emmissiveMaterial", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_glowLayer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_origMaterial", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this._scene = scene;
        this._tableau1 = this._scene.getMeshByName("Martian_tableau");
        this._tableauBack = this._scene.getMeshByName("OBJ_Picture_01");
        this._origMaterial = this._tableauBack.material;
        this._emmissiveMaterial = new StandardMaterial("emissiveMaterial", scene);
        this._emmissiveMaterial.emissiveTexture = new Texture("/textures/Martian1_emit.png", scene);
        this._glowLayer = new GlowLayer("glow", this._scene);
        this._glowLayer.intensity = 0;
        this._glowLayer.addIncludedOnlyMesh(this._tableau1);
    }
    lightUpTableau() {
        this._tableau1.isVisible = true;
        this._glowLayer.intensity = 0.5;
        this._tableau1.material = this._emmissiveMaterial;
        const material = new StandardMaterial("glowMaterial", this._scene);
        material.emissiveColor = new Color3(1, 1, 1);
        this._tableauBack.material = material;
    }
    lightOffTableau() {
        this._glowLayer.intensity = 0;
        this._tableau1.isVisible = false;
        this._tableauBack.material = this._origMaterial;
    }
    showTableau() {
        var normMaterial = new StandardMaterial("normalMaterial", this._scene);
        normMaterial.diffuseTexture = new Texture("/textures/Martian1.png", this._scene);
        this._tableau1.isVisible = true;
        this._tableau1.material = normMaterial;
    }
    getTableau1() {
        return this._tableau1;
    }
}
