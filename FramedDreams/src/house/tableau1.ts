import { Scene, Mesh, Color3, GlowLayer, StandardMaterial, Texture } from "@babylonjs/core";

export class Tableau1 {
    private _scene: Scene;
    private _tableau1: Mesh;
    private _tableauBack: Mesh;
    private _emmissiveMaterial: StandardMaterial;
    private _glowLayer: GlowLayer;
    private _origMaterial: StandardMaterial;

    constructor(scene: Scene) {
        this._scene = scene;
        this._tableau1 = this._scene.getMeshByName("Martian_tableau") as Mesh;
        this._tableauBack = this._scene.getMeshByName("OBJ_Picture_01") as Mesh;
        this._origMaterial = this._tableauBack.material as StandardMaterial;
        this._emmissiveMaterial = new StandardMaterial("emissiveMaterial", scene);
        this._emmissiveMaterial.emissiveTexture = new Texture("/textures/Martian_emit.png", scene);
        this._glowLayer = new GlowLayer("glow", this._scene);
        this._glowLayer.intensity = 0;
        this._glowLayer.addIncludedOnlyMesh(this._tableau1);

    }

    public lightUpTableau() {
        this._tableau1.isVisible = true;
        this._glowLayer.intensity = 0.5;
        this._tableau1.material = this._emmissiveMaterial;
        const material = new StandardMaterial("glowMaterial", this._scene);
        material.emissiveColor = new Color3(1, 1, 1);
        this._tableauBack.material = material;
    }

    public lightOffTableau() {  
        this._glowLayer.intensity = 0;
        this._tableau1.isVisible = false;
        this._tableauBack.material = this._origMaterial;
    }

    public showTableau() {
        var normMaterial = new StandardMaterial("normalMaterial", this._scene);
        normMaterial.diffuseTexture = new Texture("/textures/Martian.png", this._scene);
        this._tableau1.isVisible = true;
        this._tableau1.material = normMaterial;
    }

    public getTableau1(): Mesh {
        return this._tableau1;
    }
}