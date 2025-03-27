var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { AbstractScene } from "../baseScenes/abstractScene";
import { FreeCamera, Vector3, Color4, ParticleSystem, Texture, Sound } from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, Control, TextBlock } from "@babylonjs/gui";
export class StartScene extends AbstractScene {
    constructor(engine, goToCutScene) {
        super(engine);
        Object.defineProperty(this, "_goToCutScene", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_backgroundMusic", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this._goToCutScene = goToCutScene;
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            this._scene.clearColor = Color4.FromHexString("#0A1A2A");
            let camera = new FreeCamera("camera1", new Vector3(0, 0, -10), this._scene);
            camera.setTarget(Vector3.Zero());
            const particleSystem = new ParticleSystem("particles", 1000, this._scene);
            particleSystem.particleTexture = new Texture("https://playground.babylonjs.com/textures/flare.png", this._scene);
            particleSystem.minEmitBox = new Vector3(-15, -15, -20);
            particleSystem.maxEmitBox = new Vector3(15, 15, 20);
            particleSystem.color1 = Color4.FromHexString("#4F7CAC");
            particleSystem.color2 = Color4.FromHexString("#8AB6D6");
            particleSystem.minSize = 0.1;
            particleSystem.maxSize = 0.3;
            particleSystem.minLifeTime = 15;
            particleSystem.maxLifeTime = 45;
            particleSystem.emitRate = 5000;
            particleSystem.minEmitPower = 0.1;
            particleSystem.maxEmitPower = 0.3;
            particleSystem.updateSpeed = 0.01;
            particleSystem.start();
            const ui = AdvancedDynamicTexture.CreateFullscreenUI("UI");
            const title = new TextBlock();
            title.fontFamily = "Rubik Puddles";
            title.text = "Framed Dreams";
            title.color = "#D6E4F0";
            title.fontSize = 90;
            title.top = "-150px";
            title.alpha = 0;
            title.shadowBlur = 5;
            title.shadowColor = "#EDF4FA";
            title.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
            title.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
            ui.addControl(title);
            let opacity = 0;
            const fadeInterval = setInterval(() => {
                opacity += 0.02;
                title.alpha = opacity;
                if (opacity >= 1) {
                    clearInterval(fadeInterval);
                }
            }, 50);
            const startBtn = Button.CreateSimpleButton("start", "Start");
            startBtn.fontFamily = "EB Garamond";
            startBtn.width = 0.15;
            startBtn.height = "60px";
            startBtn.color = "#D6E4F0";
            startBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
            startBtn.background = "rgba(27, 43, 64, 0.3)";
            startBtn.cornerRadius = 15;
            startBtn.thickness = 0;
            startBtn.top = "-80px";
            startBtn.fontSize = 28;
            startBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
            startBtn.onPointerEnterObservable.add(() => startBtn.background = "rgba(44, 62, 86, 0.5)");
            startBtn.onPointerOutObservable.add(() => startBtn.background = "rgba(27, 43, 64, 0.3)");
            ui.addControl(startBtn);
            startBtn.onPointerDownObservable.add(() => {
                this._goToCutScene();
                this._scene.detachControl();
            });
            yield this._scene.whenReadyAsync();
            this._backgroundMusic = new Sound("backgroundMusic", "../../../sounds/startScene.mp3", this._scene, () => {
                this._backgroundMusic.loop = true;
                this._backgroundMusic.setVolume(0.2);
                this._backgroundMusic.play();
            });
        });
    }
    dispose() {
        this._scene.dispose();
    }
}
