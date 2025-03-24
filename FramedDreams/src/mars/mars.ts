import { Scene, Mesh, Vector3, TransformNode, KeyboardEventTypes } from "@babylonjs/core";
import { AdvancedDynamicTexture, Control, TextBlock } from "@babylonjs/gui";

export class Mars {
    private _scene: Scene;
    private _playerMesh: Mesh;
    private _antennes: Mesh[][] = [];
    public _advancedTexture: AdvancedDynamicTexture;
    private _dialogueText: TextBlock;
    private _portal: Mesh;
    private goToMainScene: () => void;

    constructor(scene: Scene, playerMesh: Mesh, goToMainScene: () => void) {
        this._scene = scene;
        this._playerMesh = playerMesh;
        this._advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this.goToMainScene = goToMainScene;
        this._portal = this._scene.getMeshByName("gate_complex_primitive1") as Mesh;
        this.createMessageDialogue();
        this.findAntennes();
        this._setupProximityDetection();
    }

    private createMessageDialogue() {
        this._dialogueText = new TextBlock();
        this._dialogueText.fontFamily = "EB Garamond";  // Typographie unique
        this._dialogueText.fontSize = 20;
        this._dialogueText.color = "white";
        this._dialogueText.text = "";
        this._dialogueText.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this._dialogueText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this._dialogueText.top = "35%";
        this._advancedTexture.addControl(this._dialogueText);
        this._dialogueText.alpha = 0;
    }

    private findAntennes() {
        const parentNames = ["antenne1", "antenne2", "antenne3", "antenne4", "antenne5"];
        this._antennes = []; 

        parentNames.forEach(name => {
            const parent = this._scene.getNodeByName(name) as TransformNode;
            if (parent) {
                const meshes = parent.getChildMeshes().filter(child => child instanceof Mesh) as Mesh[];
                this._antennes.push(meshes);
            } else {
                this._antennes.push([]);
            }
        });
    }

    private _antenneMessages: string[] = [
        "Signal reçu... mais il semble incomplet. Cette première antenne ne transmet que des fragments de données.",
        "L'atmosphère de Mars est étrange... je capte des signaux, mais la deuxième antenne semble avoir des interférences.",
        "Un écho résonne dans l'immensité. La troisième antenne envoie un message déformé, mais il y a un indice crucial.",
        "Les coordonnées sont floues. La quatrième antenne semble être perturbée, mais je suis presque sûr que c'est important.",
        "Une perturbation dans le signal... la cinquième antenne est en danger. Quelque chose approche, il est peut-être trop tard pour partir."
    ];

    public _setupProximityDetection(): void {
        this._scene.onBeforeRenderObservable.add(() => {
            if (!this._playerMesh) return;
    
            let closestDistance = Infinity;
            let closestMessage = "";
    
            this._antennes.forEach((antenneGroup, index) => {
                antenneGroup.forEach(mesh => {
                    let distance = Vector3.Distance(this._playerMesh.position, mesh.getAbsolutePosition());
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestMessage = this._antenneMessages[index];  // Récupère le message de l'antenne la plus proche
                    }
                });
            });
    
            if (closestDistance < 1.5) {
                this.showText(closestMessage);
            } else {
                this.hideText();
            }
        });

        this._scene.onPointerDown = (evt, pickInfo) => {
            if (pickInfo.hit) {
                const pickedMesh = pickInfo.pickedMesh;
        
                if (pickedMesh && pickedMesh === this._portal) { 
                    this.goToMainScene();
                }
                
            }
        };
    }

    private showText(message: string): void {
        this._dialogueText.text = message;
        this._dialogueText.alpha = 1;  // Affiche le texte
    }

    private hideText(): void {
        this._dialogueText.text = "";
        this._dialogueText.alpha = 0;  // Cache le texte
    }
}
