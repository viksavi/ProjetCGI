import { Scene, Mesh, Vector3, TransformNode, GlowLayer } from "@babylonjs/core";
import { Player } from "./character/characterController";   
import { GUIMars } from "../gui/guiMars"; 
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui";
import { GUIJournal } from "../gui/guiJournal";

export class Mars {
    private _scene: Scene;
    private _playerMesh: Mesh;
    private _antennes: Mesh[][] = [];
    public _advancedTexture: AdvancedDynamicTexture;
    private _portal: Mesh;
    private _antenneOrder: number[] = [0, 1, 2, 3, 4];
    private _currentAntenneIndex: number = 0;       
    private _antenneActivated: boolean[] = []; 
    private _lasers: Mesh[] = []; 
    private _gateOpened: boolean = false;
    private _isErrorMessageVisible: boolean = false;
    private _journal: GUIJournal; // Ajout du journal
    private _glowLayer: GlowLayer;
    private _guiMars: GUIMars;
    private goToMainScene: () => void;

    constructor(scene: Scene, player: Player, goToMainScene: () => void) {
        this._scene = scene;
        this._playerMesh = player.mesh;
        this._advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this.goToMainScene = goToMainScene;
        this._portal = this._scene.getMeshByName("gate_light") as Mesh;
        this._journal = new GUIJournal(this._playerMesh);
        this._guiMars = new GUIMars(this._scene);
        this.findAntennes();
        this._setupProximityDetection();
        this._guiMars.startMusic();
        this._antenneActivated = new Array(this._antennes.length).fill(false);
        this.findLasers();
        this._glowLayer = new GlowLayer("glow", this._scene, {
            mainTextureFixedSize: 1024,
            blurKernelSize: 64,
        });
        this._glowLayer.intensity = 0.8;
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
                            closestMessage = this._guiMars.getAnttenneMessages(index);
                        }
                    });
                } else {
                    console.warn(`L'antenne ${index + 1} est mal initialisée ou n'a pas d'enfants`);
                }
            });
            if(!this._isErrorMessageVisible) {
                if (closestDistance < 1.5) {
                    if(!this._antenneActivated[this._currentAntenneIndex]) {
                        this._guiMars.showText(closestMessage + `\nClick on the antenna to activate it`);
                        this._guiMars.startAntenneSounds();
                    } else {
                        this._guiMars.showText(closestMessage);
                        this._guiMars.stopMusic();
                    }
                } else {
                    this._guiMars.hideText();
                    this._guiMars.startMusic();
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
                            this._guiMars.showText("ERRROR! You must activate the antennas in order!");
                            this._isErrorMessageVisible = true; 
                            setTimeout(() => {
                                this._isErrorMessageVisible = false;
                                this._guiMars.hideText();
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
                this._guiMars.showText("Gate is opened!");
            }
        } 
    }
}