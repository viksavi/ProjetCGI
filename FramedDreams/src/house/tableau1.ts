import { Scene, Mesh, Color3, GlowLayer, StandardMaterial, Texture } from "@babylonjs/core";

/**
 * Classe représentant un tableau interactif affiché dans la scène.
 * Permet d’allumer, d’éteindre et d’afficher une version normale du tableau.
 */
export class Tableau1 {
    /** Scène Babylon.js dans laquelle se trouve le tableau */
    private _scene: Scene;

    /** Mesh principal du tableau */
    private _tableau1: Mesh;

    /** Mesh de fond du tableau */
    private _tableauBack: Mesh;

    /** Matériau émissif utilisé pour allumer le tableau */
    private _emmissiveMaterial: StandardMaterial;

    /** Effet de glow appliqué au tableau */
    private _glowLayer: GlowLayer;

    /** Matériau d’origine du fond du tableau */
    private _origMaterial: StandardMaterial;

    /**
     * Initialise le tableau et ses matériaux dans la scène.
     * @param scene - Scène Babylon.js
     */
    constructor(scene: Scene) {
        this._scene = scene;
        this._tableau1 = this._scene.getMeshByName("Martian_tableau") as Mesh;
        this._tableauBack = this._scene.getMeshByName("OBJ_Picture_01") as Mesh;
        this._origMaterial = this._tableauBack.material as StandardMaterial;
        this._emmissiveMaterial = new StandardMaterial("emissiveMaterial", scene);
        this._emmissiveMaterial.emissiveTexture = new Texture("/textures/Martian1_emit.png", scene);
        this._glowLayer = new GlowLayer("glow", this._scene);
        this._glowLayer.intensity = 0;
        this._glowLayer.addIncludedOnlyMesh(this._tableau1);
    }

    /**
     * Active la version lumineuse du tableau avec glow et texture émissive.
     */
    public lightUpTableau() {
        this._tableau1.isVisible = true;
        this._glowLayer.intensity = 0.5;
        this._tableau1.material = this._emmissiveMaterial;
        const material = new StandardMaterial("glowMaterial", this._scene);
        material.emissiveColor = new Color3(1, 1, 1);
        this._tableauBack.material = material;
    }

    /**
     * Désactive l’effet lumineux du tableau et restaure le matériau d’origine.
     */
    public lightOffTableau() {  
        this._glowLayer.intensity = 0;
        this._tableau1.isVisible = false;
        this._tableauBack.material = this._origMaterial;
    }

    /**
     * Affiche le tableau avec une texture diffuse normale (non lumineuse).
     */
    public showTableau() {
        var normMaterial = new StandardMaterial("normalMaterial", this._scene);
        normMaterial.diffuseTexture = new Texture("/textures/Martian1.png", this._scene);
        this._tableau1.isVisible = true;
        this._tableau1.material = normMaterial;
    }

    /**
     * Retourne le mesh du tableau principal.
     * @returns Le mesh Babylon.js du tableau
     */
    public getTableau1(): Mesh {
        return this._tableau1;
    }
}
