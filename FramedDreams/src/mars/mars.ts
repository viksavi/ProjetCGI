import { Scene, Mesh, Vector3, KeyboardEventTypes, TransformNode, KeyboardInfo } from "@babylonjs/core";
import { AdvancedDynamicTexture, Control, TextBlock } from "@babylonjs/gui";

export class Mars {
    private _scene: Scene;
    private _playerMesh: Mesh;
    private _antenne1: Mesh[] = [];
    private _antenne2: Mesh[] = [];
    private _antenne3: Mesh[] = [];
    private _antenne4: Mesh[] = [];
    private _antenne5: Mesh[] = [];
    private _advancedTexture: AdvancedDynamicTexture;
    private _dialogueText: TextBlock;

    constructor(scene: Scene, playerMesh: Mesh) {
        this._scene = scene;
        this._playerMesh = playerMesh;
        this._advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        
        if (!this._playerMesh) {
            console.error("Erreur : Le mesh du joueur est indéfini !");
            return;
        }
    
        this.createMessageDialogue();
        this.findAntenne();
        this.setupKeyboardEvents();
        setTimeout(() => {
            this.marsEvents();
        }, 100);
    }
    
    private createMessageDialogue() {
        this._dialogueText = new TextBlock();
        this._dialogueText.fontFamily = "EB Garamond";
        this._dialogueText.fontSize = 20;
        this._dialogueText.color = "white";
        this._dialogueText.text = "";
        this._dialogueText.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this._dialogueText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this._dialogueText.top = "35%";
        this._advancedTexture.addControl(this._dialogueText);
        this._dialogueText.alpha = 0;
    }

    private setupKeyboardEvents() {
        this._scene.onKeyboardObservable.add((kbInfo: KeyboardInfo) => {
            if (kbInfo.type === KeyboardEventTypes.KEYDOWN && kbInfo.event.key === "e") {
                if (this._dialogueText.alpha === 1) {
                    this.hideText();
                    this.showText("You are listening to the radio...");
                    console.log("Écoute de la radio");
                }
            }
        });
    }

    public marsEvents() {
        let distances = [
            ...this._antenne1,
            ...this._antenne2,
            ...this._antenne3,
            ...this._antenne4,
            ...this._antenne5
        ].map(mesh => Vector3.Distance(this._playerMesh.position, mesh.getAbsolutePosition()));

        let currentDistance = Math.min(...distances);

        if (currentDistance < 1.2) {
            this.showText("Press E to listen to the radio");
            console.log("Proche de la radio");
        } else {
            this.hideText();
            console.log("Loin de la radio");
        }
    }
    
    private findAntenne() {
        const parentNames = ["antenne1", "antenne2", "antenne3", "antenne4", "antenne5"];
        const antennes = [this._antenne1, this._antenne2, this._antenne3, this._antenne4, this._antenne5];

        parentNames.forEach((name, index) => {
            const parent = this._scene.getNodeByName(name) as TransformNode;
            if (parent) {
                antennes[index] = parent.getChildMeshes().filter(child => child instanceof Mesh) as Mesh[];
            } else {
                console.error(`Erreur : L'antenne ${name} n'a pas été trouvée !`);
            }
        });
    }

    private showText(message: string): void {
        this._dialogueText.text = message;
        this._dialogueText.alpha = 1;
    }

    private hideText(): void {
        this._dialogueText.text = "";
        this._dialogueText.alpha = 0;
    }
}