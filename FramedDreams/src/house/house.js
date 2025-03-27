import { Mesh, Vector3, HighlightLayer, Color3 } from "@babylonjs/core";
import { Door } from "./door";
import { Light } from "./light";
import { Tableau1 } from "./tableau1";
export class House {
    constructor(scene, camera, goToScene0, marsVisited) {
        Object.defineProperty(this, "_scene", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_doors", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "_light", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_glasses", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "_highlightLayer", {
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
        Object.defineProperty(this, "_glassesVisible", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_glassesOn", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_tableau", {
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
        this._marsVisited = marsVisited;
        this._scene = scene;
        this._camera = camera;
        this._light = new Light(this._scene);
        this.findDoors();
        this.makeGlasses();
        this._goToScene0 = goToScene0;
        this._tableau = new Tableau1(this._scene);
        this._highlightLayer = new HighlightLayer("highlight", this._scene);
        this.defineCamPosition();
    }
    findDoors() {
        this._scene.meshes.forEach(mesh => {
            if (mesh.name.includes("Door")) {
                this._doors.push(new Door(mesh));
            }
        });
    }
    showBook() {
        if (this._marsVisited) {
            var book = this._scene.getMeshByName("OBJ_Book");
            book.isVisible = true;
            book.visibility = 0;
            setTimeout(() => { }, 5000);
            let currentVisibility = 0;
            const fadeInterval = 50;
            const fadeIncrement = 0.05;
            let fadeTimer = 0;
            const fadeEffect = () => {
                currentVisibility += fadeIncrement;
                book.visibility = currentVisibility;
                if (currentVisibility >= 1) {
                    book.visibility = 1;
                }
                else {
                    fadeTimer = setTimeout(fadeEffect, fadeInterval);
                }
            };
            setTimeout(fadeEffect, 1000);
        }
    }
    onPointerDownEvts() {
        this._scene.onPointerDown = (_evt, pickInfo) => {
            if (pickInfo.hit) {
                const pickedMesh = pickInfo.pickedMesh;
                if (pickedMesh && this._light.getSwitches().some(mesh => mesh === pickedMesh)) {
                    this._light.changeLightState(pickedMesh);
                }
                else if (this._glassesVisible && this._glasses.some(mesh => mesh === pickedMesh)) {
                    this.putGlasses();
                    this._glassesOn = !this._glassesOn;
                }
                else if (pickedMesh && this._glassesOn && pickedMesh === this._tableau.getTableau1() && !this._marsVisited) {
                    this._marsVisited = true;
                    this._goToScene0();
                }
                else if (pickedMesh) {
                    const pickedDoor = this._doors.find(door => door.getName() === pickedMesh.name);
                    pickedDoor === null || pickedDoor === void 0 ? void 0 : pickedDoor.rotateDoor();
                }
            }
        };
        this._scene.onBeforeRenderObservable.add(() => {
            this.stairsCollision();
            if (!this._glassesOn && this.isCameraLookingAtGlasses(this._camera, this._glasses[0])) {
                this._highlightLayer.addMesh(this._glasses[0], Color3.Blue());
                this._glassesVisible = true;
            }
            else if (!this._glassesOn) {
                this._highlightLayer.removeMesh(this._glasses[0]);
                this._glassesVisible = false;
            }
            if (!this._light.getLightOn() && this._glassesOn && !this._marsVisited) {
                this._tableau.lightUpTableau();
            }
            else if (this._light.getLightOn() && !this._marsVisited) {
                this._tableau.lightOffTableau();
            }
            else {
                this._tableau.showTableau();
            }
        });
    }
    stairsCollision() {
        const camera = this._scene.activeCamera;
        const mesh1 = this._scene.getMeshByName("Collision_1.015");
        const mesh2 = this._scene.getMeshByName("Floor_10.001");
        if (mesh1 && mesh2) {
            if (camera && camera.position.y >= 3) {
                mesh1.checkCollisions = true;
                mesh2.checkCollisions = true;
            }
            else if (camera && camera.position.y < 3) {
                mesh1.checkCollisions = false;
                mesh2.checkCollisions = false;
                mesh1.isVisible = false;
            }
        }
    }
    makeGlasses() {
        const parent = this._scene.getNodeByName("OBJ_Glasses");
        const children = parent.getChildMeshes().filter(mesh => mesh instanceof Mesh);
        this._glasses.push(...children);
    }
    isCameraLookingAtGlasses(camera, glasses) {
        const cameraPosition = camera.position;
        const meshPosition = glasses.position;
        const cameraToMeshDirection = meshPosition.subtract(cameraPosition).normalize();
        const cameraForward = camera.getDirection(Vector3.Forward()).normalize();
        const dotProduct = Vector3.Dot(cameraForward, cameraToMeshDirection);
        return dotProduct > 0.5;
    }
    putGlasses() {
        this._glasses.forEach(mesh => {
            mesh.isVisible = false;
            console.log(mesh);
        });
    }
    defineCamPosition() {
        if (!this._marsVisited) {
            this._camera.position = new Vector3(-1, 4, 4);
            this._camera.target = new Vector3(-5, 1, 10);
        }
        else {
            this._camera.position = new Vector3(-9.359203794901253, 1.413385730335557, 6.270602252074229);
            this._camera.target = new Vector3(-3.6589336152389382, -3.643423967159632, 7.9839609895837285);
        }
    }
}
