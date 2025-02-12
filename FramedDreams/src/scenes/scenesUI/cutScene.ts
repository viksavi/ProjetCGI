import { AbstractScene } from "../baseScenes/abstractScene";
import { Engine, FreeCamera, Vector3, Color4, AssetContainer, SceneLoader, Scene } from "@babylonjs/core";
import { Button, Control } from "@babylonjs/gui";

export class CutScene extends AbstractScene {

    constructor(engine: Engine, goToMainScene: () => void) {
        super(engine);
        this._goToMainScene = goToMainScene;
    }

    private _goToMainScene: () => void;

    public async load(): Promise<void> {
        this._scene.clearColor = new Color4(0, 0, 0, 1);
        let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), this._scene);
        camera.setTarget(Vector3.Zero());

        const skipBtn = Button.CreateSimpleButton("skip", "SKIP");
        skipBtn.fontFamily = "Viga";
        skipBtn.width = "45px";
        skipBtn.left = "-14px";
        skipBtn.height = "40px";
        skipBtn.color = "white";
        skipBtn.top = "14px";
        skipBtn.thickness = 0;
        skipBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        skipBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.ui.addControl(skipBtn);

        const next = Button.CreateSimpleButton("next", "NEXT");
        next.color = "white";
        next.thickness = 0;
        next.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        next.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        next.width = "64px";
        next.height = "64px";
        next.top = "-3%";
        next.left = "-12%";
        this.ui.addControl(next);

        next.onPointerUpObservable.add(() => {
            this._goToMainScene();
        });

        skipBtn.onPointerDownObservable.add(()=> {
            this._scene.detachControl();
            this._engine.displayLoadingUI();
            this._goToMainScene();
        });

        await this._scene.whenReadyAsync();
    }

    public dispose(): void {
        this._scene.dispose();
    }
}