import { Scene, Mesh, Vector3, KeyboardEventTypes, TransformNode } from "@babylonjs/core";
import { AdvancedDynamicTexture, Control, TextBlock } from "@babylonjs/gui";

export class Mars {
    private _scene: Scene;
    private _playerMesh: Mesh;
    private _antenne1: Mesh[] = [];
    private _advancedTexture: AdvancedDynamicTexture;
    private _dialogueText: TextBlock;
    private _distanceInterval: number; // Pour stocker l'intervalle de temps
    private _camera;

    constructor(scene: Scene, camera: any, playerMesh: Mesh) {
        this._scene = scene;
        this._playerMesh = playerMesh;
        this._camera = camera;
        this._advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        
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
        this._dialogueText.fontSize = 30;
        this._dialogueText.color = "white";
        this._dialogueText.text = "";
        this._dialogueText.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this._dialogueText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this._advancedTexture.addControl(this._dialogueText);
        this._dialogueText.alpha = 0 //Cache l'initial

    }

    public marsEvents() {
        // Supprimer l'événement clavier
        this._scene.onBeforeRenderObservable.add(() => {

            let totalDistance = 0;
            let currentDistance = 0
            this._antenne1.forEach(mesh => {
                currentDistance = Vector3.Distance(this._playerMesh.position, mesh.getAbsolutePosition());
                totalDistance += currentDistance;
            });
            const averageDistance = totalDistance / this._antenne1.length;

            //Fonction d'affichage avec un timer
            if (averageDistance < 2){
                 this.showText("Vous êtes proche de l'antenne!");
            }
             else {
                 this.hideText();
            }
         });
    }

    private findAntenne1() {
        const parent = this._scene.getNodeByName("antenne1") as TransformNode;
        if (parent) {
            const children = parent.getChildMeshes();
            console.log("Les enfants de l'antenne :", children);
            this._antenne1 = children.filter(child => child instanceof Mesh) as Mesh[];
    
            if (this._antenne1.length === 0) {
                console.warn("Aucune antenne trouvée dans le parent !");
            } else {
                console.log("Antennes trouvées :", this._antenne1);
            }
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