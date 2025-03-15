import { AbstractScene } from "../baseScenes/abstractScene";
import { Engine, FreeCamera, Vector3, Color4, AssetContainer, SceneLoader, Scene, Animation } from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, Control, TextBlock, Rectangle } from "@babylonjs/gui";
import { MainScene } from "../gameScenes/mainScene"; // Import de la mainScene

export class CutScene extends AbstractScene {

    constructor(engine: Engine, goToMainScene: () => void) {
        super(engine);
        this._goToMainScene = goToMainScene;
    }

    private _goToMainScene: () => void;
    private _dialogueText: TextBlock;
    private _dialogueSentences: string[] = [
        "Première phrase du dialogue.",
        "Deuxième phrase, un peu plus longue.",
        "Troisième phrase, la dernière de cette scène.",
    ];
    private _currentSentenceIndex: number = 0;
    private _nextSceneButton: Button; // Ajout du bouton

    public async load(): Promise<void> {
        this._scene.clearColor = new Color4(0, 0, 0, 1);
        let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), this._scene);
        camera.setTarget(Vector3.Zero());

        // Configuration du bouton "SKIP"
        const skipBtn = Button.CreateSimpleButton("skip", "SKIP");
        skipBtn.width = "8%";
        skipBtn.height = "5%";
        skipBtn.color = "white";
        skipBtn.fontSize = 24;
        skipBtn.fontFamily = "Arial";
        skipBtn.top = "2%";
        skipBtn.thickness = 0;
        skipBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        skipBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;

        this.ui.addControl(skipBtn);

        skipBtn.onPointerDownObservable.add(() => {
            console.log("Skip button clicked."); // Ajout d'un log
            this._scene.detachControl();
            this._engine.displayLoadingUI();
            console.log("Calling _goToMainScene from skip button."); // Ajout d'un log
            this._goToMainScene();
        });

        // Configuration du texte de dialogue
        this._dialogueText = new TextBlock();
        this._dialogueText.animations = [];
        this._dialogueText.fontFamily = "Arial";
        this._dialogueText.fontSize = 36;
        this._dialogueText.color = "white";
        this._dialogueText.text = "";
        this._dialogueText.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this._dialogueText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;

        this.ui.addControl(this._dialogueText);

        // Configuration du bouton "Next Scene" (initialement caché)
        this._nextSceneButton = Button.CreateSimpleButton("nextScene", "Go to Main Scene");
        this._nextSceneButton.animations = []; // Initialisation explicite du tableau animations
        this._nextSceneButton.width = "15%"; // Ajuster la largeur
        this._nextSceneButton.height = "7%"; // Ajuster la hauteur
        this._nextSceneButton.color = "white";
        this._nextSceneButton.fontSize = 24;
        this._nextSceneButton.fontFamily = "Arial";
        this._nextSceneButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        this._nextSceneButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this._nextSceneButton.top = "-10%"; // Position en bas
        this._nextSceneButton.alpha = 0; // Invisible initialement
        this._nextSceneButton.thickness = 0;
        this.ui.addControl(this._nextSceneButton);

        this._nextSceneButton.onPointerUpObservable.add(() => {
            console.log("Go to Main Scene button clicked."); // Ajout d'un log
            this._scene.detachControl();
            this._engine.displayLoadingUI();
            console.log("Calling _goToMainScene from Go to Main Scene button."); // Ajout d'un log
            this._goToMainScene(); // Utilise la fonction fournie par AbstractScene
        });

        // Lancement du dialogue
        this._showNextSentence();

        await this._scene.whenReadyAsync();
    }

    private _showNextSentence = (): void => {
        console.log("_showNextSentence() called");
        if (this._currentSentenceIndex < this._dialogueSentences.length) {
            const sentence = this._dialogueSentences[this._currentSentenceIndex];
            this._currentSentenceIndex++;

            console.log("Fading out current text (if any)...");
            this._fadeOutText(() => {
                console.log("Text faded out. Setting new text:", sentence);
                this._dialogueText.text = sentence;
                console.log("Fading in new text...");
                this._fadeInText(() => {
                    console.log("Text faded in. Waiting 3 seconds...");
                    // Attendre avant d'afficher la phrase suivante
                    setTimeout(() => {
                        console.log("Waiting complete. Calling _showNextSentence()...");
                        this._showNextSentence();
                    }, 3000); // Afficher chaque phrase pendant 3 secondes
                });
            });
        } else {
            // Si toutes les phrases ont été affichées, afficher le bouton avec un fondu
            console.log("All sentences displayed. Fading in next scene button...");
            this._fadeInButton();
        }
    }

    private _fadeInButton(): void {
        const animation = new Animation(
            "fadeInButton",
            "alpha",
            30,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const keys = [];
        keys.push({ frame: 0, value: 0 });
        keys.push({ frame: 30, value: 1 });

        animation.setKeys(keys);

        this._nextSceneButton.animations.push(animation);
        this._scene.beginAnimation(this._nextSceneButton, 0, 30, false);
    }

    // Fonction pour le fondu en entrée
    private _fadeInText = (onComplete: () => void): void => {
        const animation = new Animation(
            "fadeIn",
            "alpha",
            30,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const keys = [];
        keys.push({ frame: 0, value: 0 });
        keys.push({ frame: 30, value: 1 });

        animation.setKeys(keys);

        this._dialogueText.animations.push(animation);
        this._scene.beginAnimation(this._dialogueText, 0, 30, false, 1, onComplete);
    }

    // Fonction pour le fondu en sortie
    private _fadeOutText = (onComplete: () => void): void => {
        const animation = new Animation(
            "fadeOut",
            "alpha",
            30,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const keys = [];
        keys.push({ frame: 0, value: 1 });
        keys.push({ frame: 30, value: 0 });

        animation.setKeys(keys);

        this._dialogueText.animations.push(animation);
        this._scene.beginAnimation(this._dialogueText, 0, 30, false, 1, onComplete);
    }

    public dispose(): void {
        console.log("CutScene dispose() called");
        this._scene.dispose();
    }
}