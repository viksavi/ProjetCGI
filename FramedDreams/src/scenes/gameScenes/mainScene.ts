import { AbstractModelScene } from "../baseScenes/abstractModelScene";
import { Engine, FreeCamera, Vector3, PointerEventTypes, Color4, Animation } from "@babylonjs/core";
import { Control, TextBlock } from "@babylonjs/gui";
import { Player } from "../../mars/character/characterController";
import { EnvironmentMain } from "../../environments/environmentMain";
import { GUIHouse } from "../../gui/guiHouse"; 
import { House } from "../../house/house";

class DialogueManager {
    private _dialogueSentences: string[];
    private _currentSentenceIndex: number = 0;

    constructor(dialogueSentences: string[]) {
        this._dialogueSentences = dialogueSentences;
    }

    public getNextSentence(): string | null {
        if (this._currentSentenceIndex < this._dialogueSentences.length) {
            const sentence = this._dialogueSentences[this._currentSentenceIndex];
            this._currentSentenceIndex++;
            return sentence;
        } else {
            return null;
        }
    }

    public reset(): void {
        this._currentSentenceIndex = 0;
    }
}

export class MainScene extends AbstractModelScene { 
    public environment: EnvironmentMain = new EnvironmentMain(this._scene);
    public player: Player;
    public assets: any;
    private _house: House;
    private _canvas: HTMLCanvasElement;
    private _camera: FreeCamera;
    private _guiHandler: GUIHouse;
    private _dialogueManager: DialogueManager;
    private _dialogueText: TextBlock;

    constructor(engine: Engine, goToScene0: () => void, canvas: HTMLCanvasElement) {
        super(engine);
        this._goToScene0 = goToScene0;
        this._canvas = canvas;
        this._guiHandler = new GUIHouse(this.ui);
    }

    private _goToScene0: () => void; //dependency injection

    public async load(): Promise<any> {
        this._scene.clearColor = new Color4(0.01568627450980392, 0.01568627450980392, 0.20392156862745098);
        this.createCamera();

        this._scene.collisionsEnabled = true;
        this._camera.checkCollisions = true;
        if (this._camera.inputs.attached.mouse) {
            this._camera.inputs.attached.mouse.detachControl();
        }
        this.initCameraControl(this._canvas, this._camera);
        await this.environment.load();
        this.environment.enableCollisions();
        this._house = new House(this._scene, this._camera, this._goToScene0);
        this._onSceneReady();

        this._dialogueManager = new DialogueManager([
            "Cet endroit... Je le connais. Mais quelque chose a changé.",
            "Je me souviens... Le cadre... C’est par là que je dois passer.",
            "Mais avant... Il me faut ces lunettes. Sans elles, je ne verrai rien.",
            "Et surtout... Ne pas oublier. Cela ne fonctionne que dans le noir.",
        ]);

        // Configuration du texte de dialogue
        this._dialogueText = new TextBlock();
        this._dialogueText.animations = [];
        this._dialogueText.fontFamily = "EB Garamond";
        this._dialogueText.fontStyle = "italic";
        this._dialogueText.fontSize = 24;
        this._dialogueText.color = "white";
        this._dialogueText.text = "";
        this._dialogueText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this._dialogueText.top = "35%";
        this.ui.addControl(this._dialogueText);

        this._showNextSentence();
    }

    public dispose(): void {
        this.disposeCameraControl();
        this._scene.dispose();
    }

    public goToScene0() { 
        this._scene.dispose(); 
        this._goToScene0();
    }

    private _onSceneReady(): void {
        this._house.onPointerDownEvts();
    }

    private createCamera() {
        this._camera = new FreeCamera("camera1", new Vector3(-1, 4, 4), this._scene);
        this._camera.setTarget(new Vector3(-5, 1, 10));
        this._camera.speed = 0.6;
        this._camera.inertia = 0.5; 
        this._camera.angularSensibility = 2000;
        this._camera.attachControl(this._canvas, true);
        this._camera.keysUp.push(87);   // W
        this._camera.keysDown.push(83); // S
        this._camera.keysLeft.push(65); // A
        this._camera.keysRight.push(68);  // D
        this._camera.keysUp.push(90);   // Z (AZERTY)
        this._camera.keysLeft.push(81); // Q (AZERTY)

        this._scene.activeCamera = this._camera;
        const assumedFramesPerSecond = 60;
        const earthGravity = -9.81;
        this._scene.gravity = new Vector3(0, earthGravity / assumedFramesPerSecond, 0);
        this._camera.applyGravity = true;
        this._camera.ellipsoid = new Vector3(0.4, 1, 0.4);
        this._camera.ellipsoidOffset = new Vector3(0, 0.7, 0);
        this._camera.minZ = 0.3;
        (this._camera as any).slopFactor = 1.5;
    }

    private disposeCameraControl(): void {
        if (document.pointerLockElement === this._canvas) {
            document.exitPointerLock();
        }

        this._scene.onPointerObservable.clear(); 
        this._canvas.removeEventListener("click", this.lockPointer);
        document.removeEventListener('pointerlockchange', this.pointerLockChange);
        this._canvas.removeEventListener("contextmenu", this.contextMenu);
    }

    private lockPointer = (event: MouseEvent) => {
        const margin = 5;
        const canvas = this._canvas;
        const rect = canvas.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
    
        if (Math.abs(event.clientX - centerX) <= margin &&
            Math.abs(event.clientY - centerY) <= margin) 
            {
                canvas.requestPointerLock = canvas.requestPointerLock || (canvas as any).mozRequestPointerLock || (canvas as any).webkitRequestPointerLock;
                if (canvas.requestPointerLock) {
                    canvas.requestPointerLock();
                }
        }
    };

    private pointerLockChange = () => {
        if (document.pointerLockElement !== this._canvas) {
            console.log("Pointer Lock lost");
        }
    };

    private contextMenu = (evt: Event) => {
        evt.preventDefault();
    };

    private initCameraControl(canvas: HTMLCanvasElement, camera: FreeCamera): void {
        const rotationSpeed = 0.005;
        const margin = 5; 
    
        const lockPointer = (event: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
    
            if (Math.abs(event.clientX - centerX) <= margin &&
                Math.abs(event.clientY - centerY) <= margin) 
                {
                    canvas.requestPointerLock = canvas.requestPointerLock || (canvas as any).mozRequestPointerLock || (canvas as any).webkitRequestPointerLock;
                    if (canvas.requestPointerLock) {
                        canvas.requestPointerLock();
                    }
            }
        };
    
        this._scene.onPointerObservable.add((pointerInfo) => {
            if (document.pointerLockElement === canvas) {
                switch (pointerInfo.type) {
                    case PointerEventTypes.POINTERMOVE:
                        const event = pointerInfo.event as MouseEvent;
                        const deltaX = event.movementX || 0;
                        const deltaY = event.movementY || 0;
    
                        camera.rotation.y += deltaX * rotationSpeed;
                        camera.rotation.x += deltaY * rotationSpeed;
                        camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
                        break;
                }
            }
        });
    
        canvas.addEventListener("click", this.lockPointer);
    
        document.addEventListener('pointerlockchange', this.pointerLockChange);
    
        canvas.addEventListener("contextmenu", this.contextMenu);
    }

    private _showNextSentence = (): void => {
        const sentence = this._dialogueManager.getNextSentence();

        if (sentence) {
            setTimeout(() => {
                this._dialogueText.text = sentence;
                this._fadeInText(() => {
                    setTimeout(() => {
                        this._fadeOutText(() => {
                            setTimeout(() => {
                                this._showNextSentence();
                            }, 1000);
                        });
                    }, 2000);
                });
            }, 1500);
        }
    }

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

    private _fadeInText = (onComplete: () => void): void => {
    const animation = this._createFadeAnimation("fadeIn", 0, 1);
    this._dialogueText.animations.push(animation);
    this._scene.beginAnimation(this._dialogueText, 0, 30, false, 1, onComplete);
 }

    private _fadeOutText = (onComplete: () => void): void => {
    const animation = this._createFadeAnimation("fadeOut", 1, 0);
    this._dialogueText.animations.push(animation);
    this._scene.beginAnimation(this._dialogueText, 0, 30, false, 1, onComplete);
    }
}