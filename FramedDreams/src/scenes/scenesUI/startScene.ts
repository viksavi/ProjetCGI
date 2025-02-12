import { AbstractScene } from "../baseScenes/abstractScene";
import { Engine, FreeCamera, Vector3, Color4 } from "@babylonjs/core";
import { Button, Control } from "@babylonjs/gui";

export class StartScene extends AbstractScene {

    constructor(engine: Engine, goToCutScene: () => void) {
        super(engine);
        this._goToCutScene = goToCutScene; 
    }

    private _goToCutScene: () => void; // dependency injection

    public async load(): Promise<void> {
        this._scene.clearColor = new Color4(0, 0, 0, 1);
        let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), this._scene);
        camera.setTarget(Vector3.Zero());

        const startBtn = Button.CreateSimpleButton("start", "PLAY");
        startBtn.width = 0.2;
        startBtn.height = "40px";
        startBtn.color = "white";
        startBtn.top = "-14px";
        startBtn.thickness = 0;
        startBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.ui.addControl(startBtn);

        startBtn.onPointerDownObservable.add(() => {
            this._goToCutScene();
            this._scene.detachControl();
        });

        await this._scene.whenReadyAsync();
    }

    public dispose(): void {
        this._scene.dispose();
    }
}