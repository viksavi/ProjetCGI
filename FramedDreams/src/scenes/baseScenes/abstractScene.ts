import { Scene, Engine } from "@babylonjs/core";
import { AdvancedDynamicTexture } from "@babylonjs/gui";

/**
 * Classe abstraite représentant une scène générique du jeu.
 * Fournit une base commune avec un moteur, une scène Babylon.js et une interface utilisateur.
 */
export abstract class AbstractScene {
    /** Scène Babylon.js utilisée dans cette scène */
    protected _scene: Scene;

    /** Moteur Babylon.js associé */
    protected _engine: Engine;

    /** Interface utilisateur plein écran (GUI) */
    public ui: AdvancedDynamicTexture;

    /**
     * Constructeur de la scène abstraite.
     * @param engine - Instance du moteur Babylon.js
     */
    constructor(engine: Engine) {
        this._engine = engine;
        this._scene = new Scene(engine);
        this.ui = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    }

    /**
     * Retourne la scène Babylon.js associée à cette scène.
     * @returns La scène Babylon.js
     */
    public getScene(): Scene {
        return this._scene;
    }

    /**
     * Méthode abstraite pour charger les éléments de la scène.
     */
    public abstract load(): Promise<any>;

    /**
     * Méthode abstraite pour nettoyer et libérer les ressources de la scène.
     */
    public abstract dispose(): void;
}
