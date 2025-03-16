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
    }));
    scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {
        this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    }));

    scene.onBeforeRenderObservable.add(() => {
        this._updateFromKeyboard();
    });
}

private _updateFromKeyboard(): void {
    // Vertical Movement
    if (this.inputMap["ArrowUp"]) {
        console.log("touche ArrowUp")
        this.vertical = Scalar.Lerp(this.vertical, 1, 0.2); // Vitesse maximale progressivement
        this.verticalAxis = 1; // Direction : avant
    } else if (this.inputMap["ArrowDown"]) {
        this.vertical = Scalar.Lerp(this.vertical, -1, 0.2);; // Vitesse maximale instantanément
        this.verticalAxis = -1; // Direction : arrière
    } else {
        this.vertical = 0; // Arrêt instantané
        this.verticalAxis = 0; // Pas de direction verticale
    }

    // Horizontal Movement
    if (this.inputMap["ArrowLeft"]) {
        this.horizontal = Scalar.Lerp(this.horizontal, -1, 0.2); // Vitesse maximale instantanément
        this.horizontalAxis = -1; // Direction : gauche
    } else if (this.inputMap["ArrowRight"]) {
        this.horizontal = Scalar.Lerp(this.horizontal, 1, 0.2); // Vitesse maximale instantanément
        this.horizontalAxis = 1; // Direction : droite
    } else {
        this.horizontal = 0; // Arrêt instantané
        this.horizontalAxis = 0; // Pas de direction horizontale
    }
}
}