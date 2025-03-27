import * as GUI from "@babylonjs/gui";
import { TextBlock, Control } from "@babylonjs/gui";
import { Animation } from "@babylonjs/core";
export class GUIHouse {
    constructor(_advancedTexture, _scene) {
        Object.defineProperty(this, "_advancedTexture", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_crosshair", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
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
        Object.defineProperty(this, "_dialogueText", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_scene", {
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
                const sentence = this.getNextSentence();
                if (sentence) {
                    setTimeout(() => {
                        this._dialogueText.text = sentence;
                        this._fadeInText(() => {
                            setTimeout(() => {
                                this._fadeOutText(() => {
                                    setTimeout(() => {
                                        this._showNextSentence();
                                    }, 1500);
                                });
                            }, 2500);
                        });
                    }, 2500);
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
        this._advancedTexture = _advancedTexture;
        this._createCrosshair();
        this._scene = _scene;
        this._createDialogueBox();
    }
    _createCrosshair() {
        this._crosshair = new GUI.Ellipse();
        this._crosshair.width = "8px";
        this._crosshair.height = "8px";
        this._crosshair.color = "white";
        this._crosshair.thickness = 1;
        this._crosshair.background = "white";
        this._crosshair.alpha = 1;
        this._crosshair.left = "0px";
        this._crosshair.top = "0px";
        this._crosshair.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this._crosshair.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this._advancedTexture.addControl(this._crosshair);
    }
    _createDialogueBox() {
        this._dialogueSentences = [
            "Cet endroit... Je le connais. Mais quelque chose a changé.",
            "Je me souviens... Le cadre... C’est par là que je dois passer.",
            "Mais avant... Il me faut ces lunettes. Sans elles, je ne verrai rien.",
            "Et surtout... Ne pas oublier. Cela ne fonctionne que dans le noir.",
        ];
        this._dialogueText = new TextBlock();
        this._dialogueText.animations = [];
        this._dialogueText.fontFamily = "EB Garamond";
        this._dialogueText.fontStyle = "italic";
        this._dialogueText.fontSize = 26;
        this._dialogueText.color = "white";
        this._dialogueText.text = "";
        this._dialogueText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this._dialogueText.top = "35%";
        this._advancedTexture.addControl(this._dialogueText);
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
    _createFadeAnimation(name, from, to) {
        const animation = new Animation(name, "alpha", 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
        const keys = [];
        keys.push({ frame: 0, value: from });
        keys.push({ frame: 30, value: to });
        animation.setKeys(keys);
        return animation;
    }
    reset() {
        this._currentSentenceIndex = 0;
    }
    dispose() {
        this._advancedTexture.dispose();
    }
    addControl(control) {
        this._advancedTexture.addControl(control);
    }
}
