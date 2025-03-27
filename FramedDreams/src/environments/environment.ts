import { Scene } from "@babylonjs/core";

/**
 * Classe abstraite représentant un environnement de scène.
 * Doit être étendue pour charger les éléments spécifiques à chaque environnement.
 */
export abstract class Environment {
    /** Scène Babylon.js dans laquelle l’environnement est chargé */
    protected _scene: Scene;

    /** Ressources/objets chargés dans l’environnement */
    public assets: any;

    /**
     * Initialise l’environnement dans une scène donnée.
     * @param scene - Scène Babylon.js
     */
    constructor(scene: Scene) {
        this._scene = scene;
    }

    /**
     * Méthode abstraite à implémenter pour charger l’environnement.
     */
    public abstract load(): Promise<void>;
}
