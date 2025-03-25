import { Scene, Mesh, Vector3, TransformNode, Sound } from "@babylonjs/core";
import { AdvancedDynamicTexture, Control, TextBlock } from "@babylonjs/gui";

export class Mars {
    private _scene: Scene;
    private _playerMesh: Mesh;
    private _antennes: Mesh[][] = [];
    public _advancedTexture: AdvancedDynamicTexture;
    private _dialogueText: TextBlock;
    private _portal: Mesh;
    private goToMainScene: () => void;
    private _backgroundMusic: Sound

    constructor(scene: Scene, playerMesh: Mesh, goToMainScene: () => void) {
        this._scene = scene;
        this._playerMesh = playerMesh;
        this._advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this.goToMainScene = goToMainScene;
        this._portal = this._scene.getMeshByName("gate_complex_primitive1") as Mesh;
        this.createMessageDialogue();
        this.findAntennes();
        this._setupProximityDetection();
        this.startMusic();
    }

    private startMusic() {
        this._backgroundMusic = new Sound("backgroundMusic", "../../../sounds/marsScene.mp3", this._scene, () => {
            this._backgroundMusic.loop = true;
            this._backgroundMusic.setVolume(0.2);
            this._backgroundMusic.play();
        });
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
        "[SIGNAL_REC] >> ERROR: Transmission incomplete...\n[ANT 1] >> Data corrupted. Receiving... **In--férenc-- détecté--.**\n[ATTEMPTING RECONNECT...] >> **C-tte pre--i-re an---enne ne tran--met que d-s fr--ments de don-é--s.**\n[WARNING] >> Signal degradation detected. Possible interference.",
        ".--- . / -.-. .- .--. - . / -.. . ... /\n ... .. --. -. .- ..- -..- .-.-.- .-.-.- .-.-.- /\n -- .- .. ... / .-.. .- / -.. . ..- -..- .. . -- . /\n .- -. - . -. -. . / . ... - / .--. . .-. - ..- .-. -... . . .-.-.-",
        "M’jnnfotjuf ftu sfnqmjf e’vo fdip gbjcmf.\nMb uspjtjfnf boufoof usbotnfu vo nfttbhf fsspof,\nnbjt dfsubjot nput tpou fodpsf bvejcmft.",
        "12-'-1-20-13-15-19-16-8-5-18-5-0-4-5-0-13-1-18-19\n5-19-20-0-5-20-18-1-14-7-5-.-.-.-12-1-0-17-21-1-20-18-9-5-13-5\n1-14-20-5-14-14-5-19-5-13-2-12-5-0-1-22-15-9-18\n4-5-19-0-9-14-20-5-18-6-5-18-5-14-3-5-19-.",
        "Señalpi huk disturbio... pichqa kaq antena\n peligropi kachkan. Yaqapaschá tardeña ripunapaq."
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

        this._scene.onPointerDown = (_evt, pickInfo) => {
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
