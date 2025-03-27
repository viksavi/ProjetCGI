var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { AbstractModelScene } from "../baseScenes/abstractModelScene";
import { FreeCamera, Vector3, PointerEventTypes, Color4 } from "@babylonjs/core";
import { EnvironmentMain } from "../../environments/environmentMain";
import { GUIHouse } from "../../gui/guiHouse";
import { House } from "../../house/house";
export class MainScene extends AbstractModelScene {
    constructor(engine, goToScene0, canvas, marsVisited) {
        super(engine);
        Object.defineProperty(this, "environment", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new EnvironmentMain(this._scene)
        });
        Object.defineProperty(this, "player", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "assets", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_house", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_canvas", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_camera", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_guiHandler", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_camPosition", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_camTarget", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_marsVisited", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_goToScene0", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "lockPointer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (event) => {
                const margin = 5;
                const canvas = this._canvas;
                const rect = canvas.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                if (Math.abs(event.clientX - centerX) <= margin &&
                    Math.abs(event.clientY - centerY) <= margin) {
                    canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
                    if (canvas.requestPointerLock) {
                        canvas.requestPointerLock();
                    }
                }
            }
        });
        Object.defineProperty(this, "pointerLockChange", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                if (document.pointerLockElement !== this._canvas) {
                    console.log("Pointer Lock lost");
                }
            }
        });
        Object.defineProperty(this, "contextMenu", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (evt) => {
                evt.preventDefault();
            }
        });
        this._goToScene0 = goToScene0;
        this._canvas = canvas;
        this._guiHandler = new GUIHouse(this.ui, this._scene);
        this._marsVisited = marsVisited;
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            this._scene.clearColor = new Color4(0.01568627450980392, 0.01568627450980392, 0.20392156862745098);
            this.createCamera();
            this._scene.collisionsEnabled = true;
            this._camera.checkCollisions = true;
            if (this._camera.inputs.attached.mouse) {
                this._camera.inputs.attached.mouse.detachControl();
            }
            this.initCameraControl(this._canvas, this._camera);
            yield this.environment.load();
            this.environment.enableCollisions();
            this._house = new House(this._scene, this._camera, this._goToScene0, this._marsVisited);
            this._onSceneReady();
            if (!this._marsVisited) {
                this._guiHandler._showNextSentence();
            }
        });
    }
    showBook() {
        this._house.showBook();
    }
    dispose() {
        this.disposeCameraControl();
        this._scene.dispose();
    }
    goToScene0() {
        this._scene.dispose();
        this._goToScene0();
    }
    _onSceneReady() {
        this._house.onPointerDownEvts();
    }
    createCamera() {
        this._camera = new FreeCamera("camera1", new Vector3(-1, 4, 4), this._scene);
        this._camera.setTarget(new Vector3(-5, 1, 10));
        this._camera.speed = 0.6;
        this._camera.inertia = 0.5;
        this._camera.angularSensibility = 2000;
        this._camera.attachControl(this._canvas, true);
        this._camera.keysUp.push(87);
        this._camera.keysDown.push(83);
        this._camera.keysLeft.push(65);
        this._camera.keysRight.push(68);
        this._camera.keysUp.push(90);
        this._camera.keysLeft.push(81);
        this._scene.activeCamera = this._camera;
        const assumedFramesPerSecond = 60;
        const earthGravity = -9.81;
        this._scene.gravity = new Vector3(0, earthGravity / assumedFramesPerSecond, 0);
        this._camera.applyGravity = true;
        this._camera.ellipsoid = new Vector3(0.4, 1, 0.4);
        this._camera.ellipsoidOffset = new Vector3(0, 0.7, 0);
        this._camera.minZ = 0.3;
        this._camera.slopFactor = 1.5;
    }
    disposeCameraControl() {
        if (document.pointerLockElement === this._canvas) {
            document.exitPointerLock();
        }
        this._scene.onPointerObservable.clear();
        this._canvas.removeEventListener("click", this.lockPointer);
        document.removeEventListener('pointerlockchange', this.pointerLockChange);
        this._canvas.removeEventListener("contextmenu", this.contextMenu);
    }
    initCameraControl(canvas, camera) {
        const rotationSpeed = 0.005;
        const margin = 5;
        const lockPointer = (event) => {
            const rect = canvas.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            if (Math.abs(event.clientX - centerX) <= margin &&
                Math.abs(event.clientY - centerY) <= margin) {
                canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
                if (canvas.requestPointerLock) {
                    canvas.requestPointerLock();
                }
            }
        };
        this._scene.onPointerObservable.add((pointerInfo) => {
            if (document.pointerLockElement === canvas) {
                switch (pointerInfo.type) {
                    case PointerEventTypes.POINTERMOVE:
                        const event = pointerInfo.event;
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
