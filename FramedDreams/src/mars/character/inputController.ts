import { Scene, ActionManager, ExecuteCodeAction, Scalar } from "@babylonjs/core";

/**
 * Gère les entrées clavier simples pour le mouvement horizontal et vertical.
 * Utilise les touches WASD / ZQSD pour détecter les directions.
 */
export class SimpleInput {
    /** Carte des touches pressées (clé = touche, valeur = état true/false) */
    public inputMap: any;

    /** Intensité de mouvement horizontal (entre -1 et 1) */
    public horizontal: number = 0;

    /** Intensité de mouvement vertical (entre -1 et 1) */
    public vertical: number = 0;

    /** Direction horizontale : -1 = gauche, 1 = droite, 0 = aucun */
    public horizontalAxis: number = 0;

    /** Direction verticale : -1 = arrière, 1 = avant, 0 = aucun */
    public verticalAxis: number = 0;

    /**
     * Initialise la gestion des entrées sur la scène donnée.
     * @param scene - Scène Babylon.js dans laquelle écouter les événements clavier
     */
    constructor(scene: Scene) {
        scene.actionManager = new ActionManager(scene);

        this.inputMap = {};
        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) => {
            this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));
        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {
            this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));

        scene.onBeforeRenderObservable.add(() => {
            this._updateFromKeyboard();
        });
    }

    /**
     * Met à jour les valeurs de direction et d’intensité en fonction des touches pressées.
     * Utilisé automatiquement à chaque frame via `onBeforeRenderObservable`.
     */
    private _updateFromKeyboard(): void {
        // Vertical Movement
        if (this.inputMap["w"] || this.inputMap["z"]) {
            this.vertical = Scalar.Lerp(this.vertical, 1, 0.2); 
            this.verticalAxis = 1;
        } else if (this.inputMap["s"]) {
            this.vertical = Scalar.Lerp(this.vertical, -1, 0.2);
            this.verticalAxis = -1;
        } else {
            this.vertical = 0;
            this.verticalAxis = 0;
        }

        // Horizontal Movement
        if (this.inputMap["a"] || this.inputMap["q"]) {
            this.horizontal = Scalar.Lerp(this.horizontal, -1, 0.2);
            this.horizontalAxis = -1;
        } else if (this.inputMap["d"]) {
            this.horizontal = Scalar.Lerp(this.horizontal, 1, 0.2);
            this.horizontalAxis = 1;
        } else {
            this.horizontal = 0;
            this.horizontalAxis = 0;
        }
    }
}
