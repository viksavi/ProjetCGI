import { Environment } from "../../environments/environment";
import { AbstractScene } from "./abstractScene";

import { Engine } from "@babylonjs/core";

/**
 * Classe abstraite pour les scènes contenant un environnement 3D.
 * Étend AbstractScene en ajoutant une propriété d’environnement.
 */
export abstract class AbstractModelScene extends AbstractScene {
    /** Environnement 3D associé à la scène */
    protected environment: Environment;

    /**
     * Constructeur de la scène modèle abstraite.
     * @param engine - Instance du moteur Babylon.js
     */
    constructor(engine: Engine) {
        super(engine);
    }
}
