import { Scene, ActionManager, ExecuteCodeAction, Scalar } from "@babylonjs/core";

export class SimpleInput {
public inputMap: any;

//simple movement
public horizontal: number = 0;
public vertical: number = 0;
//tracks whether or not there is movement in that axis
public horizontalAxis: number = 0;
public verticalAxis: number = 0;

constructor(scene: Scene) {
    scene.actionManager = new ActionManager(scene);

    this.inputMap = {};
    scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) => {
        this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        this._updateFromKeyboard(); // Mettre à jour immédiatement lors de l'appui
    }));
    scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {
        this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        this._updateFromKeyboard(); // Mettre à jour immédiatement lors du relâchement
    }));

    scene.onBeforeRenderObservable.add(() => {
        // this._updateFromKeyboard(); // Ne plus mettre à jour ici
    });
}

private _updateFromKeyboard(): void {
    // Vertical Movement
    if (this.inputMap["t"]) {
        this.vertical = 1; // Vitesse maximale instantanément
        this.verticalAxis = 1; // Direction : avant
    } else if (this.inputMap["g"]) {
        this.vertical = -1; // Vitesse maximale instantanément
        this.verticalAxis = -1; // Direction : arrière
    } else {
        this.vertical = 0; // Arrêt instantané
        this.verticalAxis = 0; // Pas de direction verticale
    }

    // Horizontal Movement
    if (this.inputMap["f"]) {
        this.horizontal = -1; // Vitesse maximale instantanément
        this.horizontalAxis = -1; // Direction : gauche
    } else if (this.inputMap["h"]) {
        this.horizontal = 1; // Vitesse maximale instantanément
        this.horizontalAxis = 1; // Direction : droite
    } else {
        this.horizontal = 0; // Arrêt instantané
        this.horizontalAxis = 0; // Pas de direction horizontale
    }
}
}