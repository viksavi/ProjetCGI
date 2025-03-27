import { AbstractScene } from "../baseScenes/abstractScene";
import { Engine, FreeCamera, Vector3, Color4, ParticleSystem, Texture, Sound } from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, Control, TextBlock } from "@babylonjs/gui";

/**
 * Scène d’introduction du jeu avec particules, musique et bouton "Start".
 */
export class StartScene extends AbstractScene {

    /** Callback pour passer à la scène CutScene */
    private _goToCutScene: () => void;

    /** Musique de fond de la scène d’accueil */
    private _backgroundMusic: Sound;

    /**
     * Constructeur de la scène d’introduction.
     * @param engine - Moteur Babylon.js
     * @param goToCutScene - Fonction appelée pour passer à la scène suivante
     */
    constructor(engine: Engine, goToCutScene: () => void) {
        super(engine);
        this._goToCutScene = goToCutScene;
    }

    /**
     * Charge tous les éléments de la scène de démarrage : caméra, particules, UI, musique, interactions.
     */
    public async load(): Promise<void> {

        this._scene.clearColor = Color4.FromHexString("#0A1A2A");
        let camera = new FreeCamera("camera1", new Vector3(0, 0, -10), this._scene);
        camera.setTarget(Vector3.Zero());

        // Particules d'arrière-plan
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

        // UI principale
        const ui = AdvancedDynamicTexture.CreateFullscreenUI("UI");

        // Titre
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
        startBtn.fontFamily = "EB Garamond";
        startBtn.width = 0.15;
        startBtn.height = "60px";
        startBtn.color = "#D6E4F0";
        startBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;

        // Transparence initiale
        startBtn.background = "rgba(27, 43, 64, 0.3)";
        startBtn.cornerRadius = 15;
        startBtn.thickness = 0;
        startBtn.top = "-80px";
        startBtn.fontSize = 28;
        startBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;

        // Réactions au survol
        startBtn.onPointerEnterObservable.add(() => startBtn.background = "rgba(44, 62, 86, 0.5)");
        startBtn.onPointerOutObservable.add(() => startBtn.background = "rgba(27, 43, 64, 0.3)");
        ui.addControl(startBtn);

        // Clique sur le bouton : changement de scène
        startBtn.onPointerDownObservable.add(() => {
            this._goToCutScene();
            this._scene.detachControl();
        });

        await this._scene.whenReadyAsync();

        // Musique d’ambiance
        this._backgroundMusic = new Sound("backgroundMusic", "../../../sounds/startScene.mp3", this._scene, () => {
            this._backgroundMusic.loop = true;
            this._backgroundMusic.setVolume(0.2);
            this._backgroundMusic.play();
        });
    }

    /**
     * Détruit et libère la scène.
     */
    public dispose(): void {
        this._scene.dispose();
    }
}
