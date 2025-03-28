import { Scene, Mesh, Vector3, TransformNode, Sound, GlowLayer } from "@babylonjs/core";
import { Player } from "./character/characterController";   
import { AdvancedDynamicTexture, Control, TextBlock } from "@babylonjs/gui";
import { GUIJournal } from "../gui/guiJournal";

export class Mars {
    private _scene: Scene;
    private _playerMesh: Mesh;
    private _antennes: Mesh[][] = [];
    public _advancedTexture: AdvancedDynamicTexture;
    private _dialogueText: TextBlock;
    private _portal: Mesh;
    private goToMainScene: () => void;
    private _backgroundMusic: Sound;
    private _antenneMusic: Sound;
    private _antenneMusicPlaying: boolean = false;
    private _antenneOrder: number[] = [0, 1, 2, 3, 4];
    private _currentAntenneIndex: number = 0;       
    private _antenneActivated: boolean[] = []; 
    private _lasers: Mesh[] = []; 
    private _gateOpened: boolean = false;
    private _isErrorMessageVisible: boolean = false;
    private _journal: GUIJournal; // Ajout du journal
    private _glowLayer: GlowLayer;

    constructor(scene: Scene, player: Player, goToMainScene: () => void) {
        this._scene = scene;
        this._playerMesh = player.mesh;
        this._advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this.goToMainScene = goToMainScene;
        this._portal = this._scene.getMeshByName("gate_light") as Mesh;

        const bookParent = this._scene.getMeshByName("book") as Mesh;

        this._journal = new GUIJournal(scene, bookParent, this._playerMesh);
        this.createMessageDialogue();
        this.findAntennes();
        this._setupProximityDetection();
        this.startMusic();
        this._antenneActivated = new Array(this._antennes.length).fill(false);
        this.findLasers();
        this._glowLayer = new GlowLayer("glow", this._scene, {
            mainTextureFixedSize: 1024,
            blurKernelSize: 64,
        });
        this._glowLayer.intensity = 0.8;
    }

    private startAntenneSounds() {
        if (this._antenneMusicPlaying) return;

        this._antenneMusicPlaying = true;
        this._antenneMusic = new Sound("antenneMusic", "../../../sounds/radioInterference.mp3", this._scene, () => {
            this._antenneMusic.loop = true;
            this._antenneMusic.setVolume(0.15);
            this._antenneMusic.play();
        });
    }

    private startMusic() {
        this._backgroundMusic = new Sound("backgroundMusic", "../../../sounds/marsScene.mp3", this._scene, () => {
            this._backgroundMusic.loop = true;
            this._backgroundMusic.setVolume(0.2);
            this._backgroundMusic.play();
        });
    }

    private findLasers() {
        for(let i = 0; i <= 4; i++) {
            const laser = this._scene.getMeshByName(`laser${i+1}`) as Mesh;
            if(laser) {
                this._lasers.push(laser);
            } else {
                console.warn(`Le laser ${i} n'a pas été trouvé`);
            }
        }
    }

    private stopMusic() {
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
        "12-'-1-20-13-15-19-16-8-5-18-5-0-4-5-0-13-1-18-19\n5-19-20-0-5-20-18-1-14-7-5-.-.-.-12-1-0-17-21-1-20-18-9-5-13-5\n1-14-20-5-14-14-5-19-5-13-2-12-5-0-1-22-15-9-18\n4-5-19-0-9-14-20-5-18-6-5-14-3-5-19-.",
        "Señalpi huk disturbio... pichqa kaq antena\n peligropi kachkan. Yaqapaschá tardeña ripunapaq."
    ];

    public _setupProximityDetection(): void {
        let closestDistance = Infinity;
        this._scene.onBeforeRenderObservable.add(() => {
            if (!this._playerMesh) return;
            closestDistance = Infinity;
            let closestMessage = "";

            this._antennes.forEach((antenneGroup, index) => {
                if (antenneGroup.length > 0) {
                    antenneGroup.forEach(mesh => {
                        let distance = Vector3.Distance(this._playerMesh.position, mesh.getAbsolutePosition());
                        if (distance < closestDistance) {
                            closestDistance = distance;
                            closestMessage = this._antenneMessages[index];
                        }
                    });
                } else {
                    console.warn(`L'antenne ${index + 1} est mal initialisée ou n'a pas d'enfants`);
                }
            });
            if(!this._isErrorMessageVisible) {
                if (closestDistance < 1.5) {
                    if(!this._antenneActivated[this._currentAntenneIndex]) {
                        this.showText(closestMessage + `\nClick on the antenna to activate it`);
                        this.startAntenneSounds();
                    } else {
                        this.showText(closestMessage);
                        this.stopMusic();
                    }
                } else {
                    this.hideText();
                    this.stopMusic();
                }
            }
            const bookParent = this._scene.getMeshByName("book") as Mesh;
            this._journal.update(bookParent);
        });

        this._scene.onPointerDown = (_evt, pickInfo) => {
            if (pickInfo.hit) {
                const pickedMesh = pickInfo.pickedMesh;

                if (pickedMesh && pickedMesh === this._portal && this._gateOpened) {
                    this.goToMainScene();
                }
                if(closestDistance < 1.5) {
                    if(!this._antenneActivated[this._currentAntenneIndex]) {
                        const currentAntenneIndexInOrder = this._antenneOrder[this._currentAntenneIndex];

                        if(pickedMesh && this._antennes[currentAntenneIndexInOrder].some(mesh => mesh === pickedMesh)) {
                            this.activateCurrentAntenne();
                        } else {
                            this.showText("ERRROR! You must activate the antennas in order!");
                            this._isErrorMessageVisible = true; 
                            setTimeout(() => {
                                this._isErrorMessageVisible = false;
                                this.hideText();
                            }, 3000);
                        }
                    }
                }

            }
        };
    }

    private activateCurrentAntenne(): void {
        const currentAntenneIndexInOrder = this._antenneOrder[this._currentAntenneIndex];

        if (!this._antenneActivated[currentAntenneIndexInOrder]) {
            this._antenneActivated[currentAntenneIndexInOrder] = true;  
            this._lasers[currentAntenneIndexInOrder].isVisible = true;
            
            this._currentAntenneIndex++;

            if (this._currentAntenneIndex >= this._antenneOrder.length) {
                this._gateOpened = true;
                this._portal.isVisible = true;
                this._scene.getLightByName("hemiLight").intensity = 0.5;
                this._scene.getLightByName("direcLight").intensity = 0.8;
                this.showText("Gate is opened!");
            }
        } 
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