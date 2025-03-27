import { AbstractScene } from "./abstractScene";
import { Engine } from "@babylonjs/core";

/**
 * Classe abstraite représentant une scène UI.
 * Sert de base pour les scènes avec interface utilisateur (UI) comme les menus ou les cutscenes.
 */
export abstract class AbstractUIScene extends AbstractScene {
    /**
     * Constructeur de la scène UI abstraite.
     * @param engine - Instance du moteur Babylon.js
     */
    constructor(engine: Engine) {
        super(engine);
    }
}
