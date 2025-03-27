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
import { FreeCamera, Vector3, Color4, Animation, Sound } from "@babylonjs/core";
import { Control, TextBlock, Rectangle } from "@babylonjs/gui";
class DialogueManager {
    constructor(dialogueSentences) {
        Object.defineProperty(this, "_dialogueSentences", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_currentSentenceIndex", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        this._dialogueSentences = dialogueSentences;
    }
    getNextSentence() {
        if (this._currentSentenceIndex < this._dialogueSentences.length) {
            const sentence = this._dialogueSentences[this._currentSentenceIndex];
            this._currentSentenceIndex++;
            return sentence;
        }
        else {
            return null;
        }
    }
    reset() {
        this._currentSentenceIndex = 0;
    }
}
export class CutScene extends AbstractScene {
    constructor(engine, goToMainScene) {
        super(engine);
        Object.defineProperty(this, "_nextSceneButtonContainer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_dialogueManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_dialogueText", {
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
        Object.defineProperty(this, "_goToMainScene", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_showNextSentence", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
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
                }
                else {
                    this._fadeInButton();
                }
            }
        });
        Object.defineProperty(this, "_fadeInText", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (onComplete) => {
                const animation = this._createFadeAnimation("fadeIn", 0, 1);
                this._dialogueText.animations.push(animation);
                this._scene.beginAnimation(this._dialogueText, 0, 30, false, 1, onComplete);
            }
        });
        Object.defineProperty(this, "_fadeOutText", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (onComplete) => {
                const animation = this._createFadeAnimation("fadeOut", 1, 0);
                this._dialogueText.animations.push(animation);
                this._scene.beginAnimation(this._dialogueText, 0, 30, false, 1, onComplete);
            }
        });
        this._goToMainScene = goToMainScene;
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            this._scene.clearColor = new Color4(0, 0, 0, 1);
            let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), this._scene);
            camera.setTarget(Vector3.Zero());
            this._dialogueManager = new DialogueManager([
                "Où suis-je... ?",
                "Pourquoi fait-il si sombre ?",
                "Je devrais me souvenir... mais de quoi ?",
                "Quelque chose m'attend... je le sens.",
                "Il est temps d’ouvrir les yeux."
            ]);
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
            this._nextSceneButtonContainer.background = "transparent";
            const buttonText = new TextBlock();
            buttonText.fontFamily = "EB Garamond";
            buttonText.text = "Se réveiller";
            buttonText.color = "rgba(255, 255, 255, 0.5)";
            buttonText.shadowBlur = 0;
            buttonText.shadowColor = "rgba(255, 255, 255, 0.5)";
            buttonText.fontSize = 24;
            this._nextSceneButtonContainer.addControl(buttonText);
            this._nextSceneButtonContainer.onPointerEnterObservable.add(() => {
                buttonText.color = "rgba(255, 255, 255, 1)";
                buttonText.shadowBlur = 15;
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
            this._showNextSentence();
            yield this._scene.whenReadyAsync();
            this._backgroundMusic = new Sound("backgroundMusic", "../../../sounds/cutScene.mp3", this._scene, () => {
                this._backgroundMusic.loop = true;
                this._backgroundMusic.setVolume(0.2);
                this._backgroundMusic.play();
            });
        });
    }
    _fadeInButton() {
        const animation = new Animation("fadeInButton", "alpha", 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
        const keys = [];
        keys.push({ frame: 0, value: 0 });
        keys.push({ frame: 30, value: 1 });
        animation.setKeys(keys);
        this._nextSceneButtonContainer.animations.push(animation);
        this._scene.beginAnimation(this._nextSceneButtonContainer, 0, 30, false);
    }
    _createFadeAnimation(name, from, to) {
        const animation = new Animation(name, "alpha", 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
        const keys = [];
        keys.push({ frame: 0, value: from });
        keys.push({ frame: 30, value: to });
        animation.setKeys(keys);
        return animation;
    }
    dispose() {
        this._scene.dispose();
    }
}
