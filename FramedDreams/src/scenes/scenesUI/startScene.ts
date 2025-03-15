import { AbstractScene } from "../baseScenes/abstractScene";
import { Engine, FreeCamera, Vector3, Color4, ParticleSystem, Texture, MeshBuilder } from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, Control, TextBlock, Rectangle } from "@babylonjs/gui";
import { IPerfMetadataCategory } from "@babylonjs/inspector/components/actionTabs/tabs/performanceViewer/performanceViewerComponent";

export class StartScene extends AbstractScene {

    constructor(engine: Engine, goToCutScene: () => void) {
        super(engine);
        this._goToCutScene = goToCutScene;
    }

    private _goToCutScene: () => void;

    public async load(): Promise<void> {
        this._scene.clearColor = new Color4(0.05, 0.05, 0.15, 1);
        let camera = new FreeCamera("camera1", new Vector3(0, 0, -10), this._scene);
        camera.setTarget(Vector3.Zero());

        // Particules d'arrière-plan
        const particleSystem = new ParticleSystem("particles", 1000, this._scene);
        particleSystem.particleTexture = new Texture("https://playground.babylonjs.com/textures/flare.png", this._scene);

        particleSystem.minEmitBox = new Vector3(-15, -15, -20);
        particleSystem.maxEmitBox = new Vector3(15, 15, 20);

        particleSystem.color1 = new Color4(0.8, 0.5, 1, 0.7);
        particleSystem.color2 = new Color4(0.5, 0.3, 0.9, 0.7);

        particleSystem.minSize = 0.1;
        particleSystem.maxSize = 0.3;

        particleSystem.minLifeTime = 15;
        particleSystem.maxLifeTime = 45;

        particleSystem.emitRate = 5000;

        particleSystem.minEmitPower = 0.1;
        particleSystem.maxEmitPower = 0.3;
        particleSystem.updateSpeed = 0.01;

        particleSystem.start();

        // UI principale
        const ui = AdvancedDynamicTexture.CreateFullscreenUI("UI");

        // Titre
        const title = new TextBlock();
        title.fontFamily = "Rubik Puddles";
        title.text = "Framed Dreams";
        title.color = "#dce6ff";
        title.fontSize = 90;
        title.top = "-150px";
        title.alpha = 0;
        title.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        ui.addControl(title);

        // Animation de fondu progressive
        let opacity = 0;
        const fadeInterval = setInterval(() => {
            opacity += 0.02;
            title.alpha = opacity;
            if (opacity >= 1) {
                clearInterval(fadeInterval);
            }
        }, 50);

        // Bouton PLAY stylisé
        const startBtn = Button.CreateSimpleButton("start", "Start");
        startBtn.fontFamily = "Special Elite";
        startBtn.width = 0.2;
        startBtn.height = "60px";
        startBtn.color = "#dce6ff";
        startBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        
        // Transparence initiale (presque transparent)
        startBtn.background = "rgba(38, 118, 171, 0.2)"; // Equivalent de #2676ab avec alpha à 0.2
        startBtn.cornerRadius = 15;
        startBtn.thickness = 0; // Retire la bordure pour un aspect plus discret
        startBtn.top = "-80px";
        startBtn.fontSize = 24;
        startBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;

        // Augmente l'opacité au survol
        startBtn.onPointerEnterObservable.add(() => startBtn.background = "rgba(38, 118, 171, 0.5)"); // Alpha à 0.5 au survol
        startBtn.onPointerOutObservable.add(() => startBtn.background = "rgba(38, 118, 171, 0.2)"); // Retour à la transparence initiale
        ui.addControl(startBtn);

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