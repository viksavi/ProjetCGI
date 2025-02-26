import { Scene, ActionManager, ExecuteCodeAction, Observer, Scalar } from "@babylonjs/core";

export class PlayerInput {
    public inputMap: any;

    //Mouvement
    public horizontal: number = 0;
    public vertical: number = 0;
    //Traque s'il y a du mouvement sur cet axe
    public horizontalAxis: number = 0;
    public verticalAxis: number = 0;

    constructor(scene: Scene) {
        scene.actionManager = new ActionManager(scene);

        this.inputMap = {};
        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) => {
            this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
            //this._walkAnimation.start(true); // Démarrer l'animation en boucle
            this._updateFromKeyboard(); // Mettre à jour lors de l'appui
        }));
        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {
            this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
            //this._walkAnimation.start(false); // Arrêter l'animation
            this._updateFromKeyboard(); // Mettre à jour lors du relâchement
        }));

        scene.onBeforeRenderObservable.add(() => {
            this._updateFromKeyboard(); // Ne plus mettre à jour ici
        });
    }

    private _updateFromKeyboard(): void {
        // Vertical Movement
        if (this.inputMap["t"]) {
            this.vertical = Scalar.Lerp(this.vertical, 1, 0.2); // Vitesse max progressive
            this.verticalAxis = 1; // Direction : avant

        } else if (this.inputMap["g"]) {
            this.vertical = Scalar.Lerp(this.vertical, -1, 0.2);
            this.verticalAxis = -1; // Direction : arrière

        } else {
            this.vertical = 0; // Arrêt instantané
            this.verticalAxis = 0; // Pas de direction verticale
        }

        // Horizontal Movement
        if (this.inputMap["f"]) {
            this.horizontal = Scalar.Lerp(this.horizontal, -1, 0.2); // Vitesse maximale progressive
            this.horizontalAxis = -1; // Direction : gauche

        } else if (this.inputMap["h"]) {
            this.horizontal = Scalar.Lerp(this.horizontal, 1, 0.2);
            this.horizontalAxis = 1; // Direction : droite

        } else {
            this.horizontal = 0; // Arrêt instantané
            this.horizontalAxis = 0; // Pas de direction horizontale
        }
    }
}