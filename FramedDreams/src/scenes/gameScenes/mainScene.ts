import { AbstractModelScene } from "../baseScenes/abstractModelScene";
import { Engine, FreeCamera, Vector3, PointerEventTypes, Color4 } from "@babylonjs/core";
import { Player } from "../../mars/character/characterController";
import { EnvironmentMain } from "../../environments/environmentMain";
import { GUIHouse } from "../../gui/guiHouse"; 
import { House } from "../../house/house";

export class MainScene extends AbstractModelScene { 
    public environment: EnvironmentMain = new EnvironmentMain(this._scene);
    public player: Player;
    public assets: any;
    private _house: House;
    private _canvas: HTMLCanvasElement;
    private _camera: FreeCamera;
    private _guiHandler: GUIHouse;
    private _camPosition: Vector3;
    private _camTarget: Vector3;
    private _marsVisited: boolean;

    constructor(engine: Engine, goToScene0: () => void, canvas: HTMLCanvasElement, marsVisited: boolean) {
        super(engine);
        this._goToScene0 = goToScene0;
        this._canvas = canvas;
        this._guiHandler = new GUIHouse(this.ui, this._scene);
        this._marsVisited = marsVisited;
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
        this._house = new House(this._scene, this._camera, this._goToScene0, this._marsVisited);
        this._onSceneReady();
        if(!this._marsVisited) {
            this._guiHandler._showNextSentence();
        }
    }

    public showBook() {
        this._house.showBook();
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

}