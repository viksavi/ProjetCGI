import { AbstractScene } from "../baseScenes/abstractScene";
import { Engine, FreeCamera, Vector3, Color4, Animation, Sound } from "@babylonjs/core";
import { Control, TextBlock, Rectangle } from "@babylonjs/gui";

// Classe pour gérer le dialogue
class DialogueManager {
    private _dialogueSentences: string[];
    private _currentSentenceIndex: number = 0;

    constructor(dialogueSentences: string[]) {
        this._dialogueSentences = dialogueSentences;
    }

    public getNextSentence(): string | null {
        if (this._currentSentenceIndex < this._dialogueSentences.length) {
            const sentence = this._dialogueSentences[this._currentSentenceIndex];
            this._currentSentenceIndex++;
            return sentence;
        } else {
            return null; // Fin du dialogue
        }
    }

    public reset(): void {
        this._currentSentenceIndex = 0;
    }
}

/**
 * Scène de type "Cut Scene" avec dialogues séquentiels et transition vers la scène principale.
 */
export class CutScene extends AbstractScene {

    /** Conteneur du bouton de transition vers la scène suivante */
    private _nextSceneButtonContainer: Rectangle;

    /** Gestionnaire de dialogues affichant les phrases une par une */
    private _dialogueManager: DialogueManager;

    /** Zone de texte affichant le dialogue en cours */
    private _dialogueText: TextBlock;

    /** Musique de fond de la scène */
    private _backgroundMusic: Sound;

    /** Callback pour passer à la scène principale */
    private _goToMainScene: () => void;

    /**
     * Constructeur de la CutScene.
     * @param engine - Moteur Babylon.js
     * @param goToMainScene - Fonction à appeler pour passer à la scène principale
     */
    constructor(engine: Engine, goToMainScene: () => void) {
        super(engine);
        this._goToMainScene = goToMainScene;
    }

    /**
     * Charge tous les éléments de la scène : caméra, dialogues, UI, musique.
     */
    public async load(): Promise<void> {
        this._scene.clearColor = new Color4(0, 0, 0, 1);
        let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), this._scene);
        camera.setTarget(Vector3.Zero());

        // Initialise le gestionnaire de dialogue avec les phrases
        this._dialogueManager = new DialogueManager([
            "Où suis-je... ?",
            "Pourquoi fait-il si sombre ?",
            "Je devrais me souvenir... mais de quoi ?",
            "Quelque chose m'attend... je le sens.",
            "Il est temps d’ouvrir les yeux."
        ]);

        // Configuration du texte de dialogue
        this._dialogueText = new TextBlock();
        this._dialogueText.animations = [];
        this._dialogueText.fontFamily = "EB Garamond";
        this._dialogueText.fontSize = 30;
        this._dialogueText.color = "white";
        this._dialogueText.text = "";
        this._dialogueText.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this._dialogueText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this._dialogueText.top = "-2%";
        this.ui.addControl(this._dialogueText);

        // Configuration du bouton "Next Scene"
        this._nextSceneButtonContainer = new Rectangle("nextSceneContainer");
        this._nextSceneButtonContainer.animations = [];
        this._nextSceneButtonContainer.width = "15%";
        this._nextSceneButtonContainer.height = "7%";
        this._nextSceneButtonContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        this._nextSceneButtonContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this._nextSceneButtonContainer.top = "-10%";
        this._nextSceneButtonContainer.alpha = 0;
        this._nextSceneButtonContainer.thickness = 0;
        this.ui.addControl(this._nextSceneButtonContainer);

        // Style du container
        this._nextSceneButtonContainer.background = "transparent";

        // Crée le TextBlock pour le texte
        const buttonText = new TextBlock();
        buttonText.fontFamily = "EB Garamond";
        buttonText.text = "Se réveiller";
        buttonText.color = "rgba(255, 255, 255, 0.5)";
        buttonText.shadowBlur = 0;
        buttonText.shadowColor = "rgba(255, 255, 255, 0.5)";
        buttonText.fontSize = 24;
        this._nextSceneButtonContainer.addControl(buttonText);

        // Ajoute un effet de surbrillance au survol
        this._nextSceneButtonContainer.onPointerEnterObservable.add(() => {
            buttonText.color = "rgba(255, 255, 255, 1)";
            buttonText.shadowBlur = 15 ;
        });

        this._nextSceneButtonContainer.onPointerOutObservable.add(() => {
            buttonText.color = "rgba(255, 255, 255, 0.5)";
            buttonText.shadowBlur = 0;
        });

        this._nextSceneButtonContainer.onPointerUpObservable.add(() => {
            this._scene.detachControl();
            this._engine.displayLoadingUI();
            this._goToMainScene();
        });

        // Lancement du dialogue
        this._showNextSentence();

        await this._scene.whenReadyAsync();

        this._backgroundMusic = new Sound("backgroundMusic", "../../../sounds/cutScene.mp3", this._scene, () => {
            this._backgroundMusic.loop = true;
            this._backgroundMusic.setVolume(0.2);
            this._backgroundMusic.play();
        });
    }

    /**
     * Affiche progressivement chaque phrase du dialogue, puis le bouton.
     */
    private _showNextSentence = (): void => {
        const sentence = this._dialogueManager.getNextSentence();

        if (sentence) {
            this._fadeOutText(() => {
                this._dialogueText.text = sentence;
                setTimeout(() => {
                    this._fadeInText(() => {
                        setTimeout(() => {
                            this._showNextSentence();
                        }, 2000);
                    });
                }, 1000);
            });
        } else {
            this._fadeInButton();
        }
    }

    /**
     * Lance l'animation de fondu pour faire apparaître le bouton de scène suivante.
     */
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

        this._nextSceneButtonContainer.animations.push(animation);
        this._scene.beginAnimation(this._nextSceneButtonContainer, 0, 30, false);
    }

    /**
     * Crée une animation de fondu d'opacité.
     * @param name - Nom de l’animation
     * @param from - Valeur de départ
     * @param to - Valeur finale
     */
    private _createFadeAnimation(name: string, from: number, to: number): Animation {
        const animation = new Animation(
            name,
            "alpha",
            30,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const keys = [];
        keys.push({ frame: 0, value: from });
        keys.push({ frame: 30, value: to });

        animation.setKeys(keys);
        return animation;
    }

    /**
     * Anime l’apparition du texte (fondu entrant).
     * @param onComplete - Callback appelé après animation
     */
    private _fadeInText = (onComplete: () => void): void => {
        const animation = this._createFadeAnimation("fadeIn", 0, 1);
        this._dialogueText.animations.push(animation);
        this._scene.beginAnimation(this._dialogueText, 0, 30, false, 1, onComplete);
    }

    /**
     * Anime la disparition du texte (fondu sortant).
     * @param onComplete - Callback appelé après animation
     */
    private _fadeOutText = (onComplete: () => void): void => {
        const animation = this._createFadeAnimation("fadeOut", 1, 0);
        this._dialogueText.animations.push(animation);
        this._scene.beginAnimation(this._dialogueText, 0, 30, false, 1, onComplete);
    }

    /**
     * Nettoie la scène CutScene.
     */
    public dispose(): void {
        this._scene.dispose();
    }
}
