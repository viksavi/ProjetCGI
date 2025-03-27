import * as GUI from "@babylonjs/gui";
import { AdvancedDynamicTexture, TextBlock, Control } from "@babylonjs/gui";
import { Animation, Scene } from "@babylonjs/core";

/**
 * Interface utilisateur de la maison : viseur, dialogues narratifs, effets de fondu.
 */
export class GUIHouse {
    /** UI BabylonJS utilisée pour afficher les éléments à l’écran */
    private _advancedTexture: AdvancedDynamicTexture;

    /** Élément représentant le viseur au centre de l’écran */
    private _crosshair: GUI.Ellipse;

    /** Liste des phrases de dialogue à afficher séquentiellement */
    private _dialogueSentences: string[];

    /** Index actuel dans la séquence de dialogues */
    private _currentSentenceIndex: number = 0;

    /** Zone de texte affichant les dialogues */
    private _dialogueText: TextBlock;

    /** Scène BabylonJS associée */
    private _scene: Scene;

    /**
     * Initialise l’interface GUI de la maison avec viseur et boîte de dialogue.
     * @param _advancedTexture - Texture GUI plein écran
     * @param _scene - Scène BabylonJS
     */
    constructor(_advancedTexture: AdvancedDynamicTexture, _scene: Scene) {
        this._advancedTexture = _advancedTexture;
        this._createCrosshair();
        this._scene = _scene;
        this._createDialogueBox();
    }

    /**
     * Crée et affiche un petit viseur (ellipse) au centre de l’écran.
     */
    private _createCrosshair(): void {
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

    /**
     * Crée la boîte de dialogue contenant le texte narratif.
     */
    private _createDialogueBox(): void {
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

    /**
     * Retourne la prochaine phrase à afficher, ou null s’il n’y en a plus.
     */
    public getNextSentence(): string | null {
        if (this._currentSentenceIndex < this._dialogueSentences.length) {
            const sentence = this._dialogueSentences[this._currentSentenceIndex];
            this._currentSentenceIndex++;
            return sentence;
        } else {
            return null;
        }
    }

    /**
     * Démarre l’affichage automatique des dialogues avec animation de fondu.
     */
    public _showNextSentence = (): void => {
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

    /**
     * Crée une animation de fondu (transparence alpha) sur un contrôle.
     * @param name - Nom de l’animation
     * @param from - Valeur de départ
     * @param to - Valeur de fin
     * @returns L’animation créée
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
     * Lance une animation de fondu entrant pour le texte de dialogue.
     * @param onComplete - Callback après animation
     */
    private _fadeInText = (onComplete: () => void): void => {
        const animation = this._createFadeAnimation("fadeIn", 0, 1);
        this._dialogueText.animations.push(animation);
        this._scene.beginAnimation(this._dialogueText, 0, 30, false, 1, onComplete);
    }

    /**
     * Lance une animation de fondu sortant pour le texte de dialogue.
     * @param onComplete - Callback après animation
     */
    private _fadeOutText = (onComplete: () => void): void => {
        const animation = this._createFadeAnimation("fadeOut", 1, 0);
        this._dialogueText.animations.push(animation);
        this._scene.beginAnimation(this._dialogueText, 0, 30, false, 1, onComplete);
    }

    /**
     * Réinitialise la progression des dialogues.
     */
    public reset(): void {
        this._currentSentenceIndex = 0;
    }

    /**
     * Supprime toute l’interface utilisateur.
     */
    public dispose(): void {
        this._advancedTexture.dispose();
    }

    /**
     * Ajoute un contrôle supplémentaire à l’interface (UI avancée).
     * @param control - Contrôle BabylonJS à ajouter
     */
    public addControl(control: GUI.Control): void {
        this._advancedTexture.addControl(control);
    }
}
