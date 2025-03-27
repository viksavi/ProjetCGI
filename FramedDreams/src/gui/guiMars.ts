import { AdvancedDynamicTexture, TextBlock, Control } from "@babylonjs/gui";
import { Scene, Sound } from "@babylonjs/core";

export class GUIMars {
    public _advancedTexture: AdvancedDynamicTexture;
    private _dialogueText: TextBlock;
    private _backgroundMusic: Sound;
    private _antenneMusic: Sound;
    private _antenneMusicPlaying: boolean = false;
    private _scene: Scene;
    private _antenneMessages: string[]; 

    public constructor(scene: Scene) {
        this._advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this._scene = scene;
        this.createMessageDialogue();
        this._antenneMessages = [
            "[SIGNAL_REC] >> ERROR: Transmission incomplete...\n[ANT 1] >> Data corrupted. Receiving... **In--férenc-- détecté--.**\n[ATTEMPTING RECONNECT...] >> **C-tte pre--i-re an---enne ne tran--met que d-s fr--ments de don-é--s.**\n[WARNING] >> Signal degradation detected. Possible interference.",
            ".--- . / -.-. .- .--. - . / -.. . ... /\n ... .. --. -. .- ..- -..- .-.-.- .-.-.- .-.-.- /\n -- .- .. ... / .-.. .- / -.. . ..- -..- .. . -- . /\n .- -. - . -. -. . / . ... - / .--. . .-. - ..- .-. -... . . .-.-.-",
            "M’jnnfotjuf ftu sfnqmjf e’vo fdip gbjcmf.\nMb uspjtjfnf boufoof usbotnfu vo nfttbhf fsspof,\nnbjt dfsubjot nput tpou fodpsf bvejcmft.",
            "12-'-1-20-13-15-19-16-8-5-18-5-0-4-5-0-13-1-18-19\n5-19-20-0-5-20-18-1-14-7-5-.-.-.-12-1-0-17-21-1-20-18-9-5-13-5\n1-14-20-5-14-14-5-19-5-13-2-12-5-0-1-22-15-9-18\n4-5-19-0-9-14-20-5-18-6-5-14-3-5-19-.",
            "Señalpi huk disturbio... pichqa kaq antena\n peligropi kachkan. Yaqapaschá tardeña ripunapaq."
        ];
    }

    public getAnttenneMessages(index): string {
        return this._antenneMessages[index];
    }


    public startAntenneSounds() {
        if (this._antenneMusicPlaying) return;

        this._antenneMusicPlaying = true;
        this._antenneMusic = new Sound("antenneMusic", "/../sounds/radioInterference.mp3", this._scene, () => {
            this._antenneMusic.loop = true;
            this._antenneMusic.setVolume(0.15);
            this._antenneMusic.play();
        });
    }

    public startMusic() {
        this._backgroundMusic = new Sound("backgroundMusic", "/../sounds/marsScene.mp3", this._scene, () => {
            this._backgroundMusic.loop = true;
            this._backgroundMusic.setVolume(0.2);
            this._backgroundMusic.play();
        });
    }

    public stopMusic() {
        if (this._antenneMusic) {
            this._antenneMusic.stop();
            this._antenneMusicPlaying = false;
        }
    }

    private createMessageDialogue() {
        this._dialogueText = new TextBlock();
        this._dialogueText.fontFamily = "Cousine";
        this._dialogueText.fontSize = 15;
        this._dialogueText.color = "white";
        this._dialogueText.text = "";
        this._dialogueText.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this._dialogueText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this._dialogueText.top = "35%";
        this._advancedTexture.addControl(this._dialogueText);
        this._dialogueText.alpha = 0;
    }

    public showText(message: string): void {
        this._dialogueText.text = message;
        this._dialogueText.alpha = 1;
    }

    public hideText(): void {
        this._dialogueText.text = "";
        this._dialogueText.alpha = 0;
    }
}