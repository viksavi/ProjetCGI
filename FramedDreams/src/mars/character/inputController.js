import { ActionManager, ExecuteCodeAction, Scalar } from "@babylonjs/core";
export class SimpleInput {
    constructor(scene) {
        Object.defineProperty(this, "inputMap", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "horizontal", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "vertical", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "horizontalAxis", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "verticalAxis", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
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
    _updateFromKeyboard() {
        if (this.inputMap["w"] || this.inputMap["z"]) {
            this.vertical = Scalar.Lerp(this.vertical, 1, 0.2);
            this.verticalAxis = 1;
        }
        else if (this.inputMap["s"]) {
            this.vertical = Scalar.Lerp(this.vertical, -1, 0.2);
            ;
            this.verticalAxis = -1;
        }
        else {
            this.vertical = 0;
            this.verticalAxis = 0;
        }
        if (this.inputMap["a"] || this.inputMap["q"]) {
            this.horizontal = Scalar.Lerp(this.horizontal, -1, 0.2);
            this.horizontalAxis = -1;
        }
        else if (this.inputMap["d"]) {
            this.horizontal = Scalar.Lerp(this.horizontal, 1, 0.2);
            this.horizontalAxis = 1;
        }
        else {
            this.horizontal = 0;
            this.horizontalAxis = 0;
        }
    }
}
