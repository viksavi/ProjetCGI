import { Scene, Mesh, Vector3, KeyboardEventTypes, TransformNode, KeyboardInfo } from "@babylonjs/core";
import { AdvancedDynamicTexture, Control, TextBlock } from "@babylonjs/gui";

export class Mars {
    private _scene: Scene;
    private _playerMesh: Mesh;
    private _antenne1: Mesh[] = [];
    public _advancedTexture: AdvancedDynamicTexture;
    private _dialogueText: TextBlock;
    private goToMainScene: () => void

    constructor(scene: Scene, playerMesh: Mesh, goToMainScene: () => void) {
        this._scene = scene;
        this._playerMesh = playerMesh;
        this._advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this.goToMainScene = goToMainScene;

        if (!this._playerMesh) {
            console.error("Erreur : Le mesh du joueur est indéfini !");
            return;
        }
        
        this.createMessageDialogue();
        this.findAntenne1();
        setTimeout(() => {
            this.marsEvents();
        }, 100);
    }    
    

    private createMessageDialogue() {
        // Configuration du texte de dialogue
        this._dialogueText = new TextBlock();
        this._dialogueText.fontFamily = "EB Garamond";
        this._dialogueText.fontSize = 20;
        this._dialogueText.color = "white";
        this._dialogueText.text = "";
        this._dialogueText.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this._dialogueText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this._dialogueText.top = "40%";
        this._advancedTexture.addControl(this._dialogueText);
        this._dialogueText.alpha = 0

    }

    public marsEvents() {
        let canInteract = false; // Suivi de l'état d'interaction
        let isListening = false; // Suivi de l'état de la radio

        this._scene.onBeforeRenderObservable.add(() => {
            let currentDistance = Math.min(...this._antenne1.map(mesh => 
                Vector3.Distance(this._playerMesh.position, mesh.getAbsolutePosition())
            ));
    
            if (currentDistance < 2) {
                if (!canInteract && !isListening) { 
                    this.showText("Press E to listen to the radio");
                    canInteract = true;
                }
            } else {
                if (canInteract) { 
                    this.hideText();
                    canInteract = false;
                    isListening = false; // Réinitialiser l'état de la radio
                }
            }

            
        });
    
        // Ajout unique de l'événement clavier
        this._scene.onKeyboardObservable.add((kbInfo) => {
            if (kbInfo.type === KeyboardEventTypes.KEYDOWN && kbInfo.event.key === "e") {
                if (canInteract) {
                    if (!isListening) {
                        this.showText("You are listening to the radio...");
                        console.log("You are listening to the radio...");
                        isListening = true;
                    } else {
                        this.hideText(); // Masquer le texte quand on appuie de nouveau sur E
                        console.log("You stopped listening to the radio.");
                        isListening = false;
                    }
                }
            }
            if (kbInfo.type === KeyboardEventTypes.KEYDOWN && kbInfo.event.key === "h") {
                console.log("H key pressed! Transitioning to MainScene...");
                this.goToMainScene(); 
            }
        });
    }
      
    

    private findAntenne1() {
        const parent = this._scene.getNodeByName("antenne1") as TransformNode;
        if (parent) {
            const children = parent.getChildMeshes();
            this._antenne1 = children.filter(child => child instanceof Mesh) as Mesh[];
        } else {
            console.warn("Il n'y a pas d'antenne !");
        }
    }    


    private showText(message: string): void {
        this._dialogueText.text = message
        this._dialogueText.alpha = 1

    }

    private hideText(): void {
        this._dialogueText.text = ""
        this._dialogueText.alpha = 0
    }
}