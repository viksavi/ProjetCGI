import { Scene, Mesh, Vector3, FreeCamera,  HighlightLayer, Color3, Animation } from "@babylonjs/core";
import { Door } from "./door"
import { Light } from "./light"
import { Tableau1 } from "./tableau1"

export class House {
    private _scene: Scene;
    private _doors: Door[] = [];
    private _light: Light;
    private _glasses: Mesh[] = [];
    private _highlightLayer: HighlightLayer;
    private _camera: FreeCamera;
    private _glassesVisible: boolean = false;
    private _glassesOn: boolean = false;
    private _tableau: Tableau1;
    private _marsVisited: boolean;

    constructor(scene: Scene, camera: FreeCamera, goToScene0: () => void, marsVisited: boolean) {
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

    private _goToScene0: () => void;

    private findDoors() {
        this._scene.meshes.forEach(mesh => {
            if (mesh.name.includes("Door")) {
                this._doors.push(new Door(mesh as Mesh));
            }
        });
    }

    public showBook() {
        if(this._marsVisited) {
            var book = this._scene.getMeshByName("OBJ_Book");
            book.isVisible = true;
            book.visibility = 0; 
            setTimeout(() => {}, 5000);
            let currentVisibility = 0;
            const fadeInterval = 50; 
            const fadeIncrement = 0.05; 
            let fadeTimer = 0;

            const fadeEffect = () => {
                currentVisibility += fadeIncrement;
                book.visibility = currentVisibility;

                if (currentVisibility >= 1) {
                    book.visibility = 1; 
                } else {
                    fadeTimer = setTimeout(fadeEffect, fadeInterval); 
                }
            };

            setTimeout(fadeEffect, 1000);
        }
    }

    public onPointerDownEvts() {
        this._scene.onPointerDown = (_evt, pickInfo) => {
            if (pickInfo.hit) {
                const pickedMesh = pickInfo.pickedMesh;
        
                if (pickedMesh && this._light.getSwitches().some(mesh => mesh === pickedMesh)) { 
                    this._light.changeLightState(pickedMesh);
                }
                else if(this._glassesVisible && this._glasses.some(mesh => mesh === pickedMesh)) {
                    this.putGlasses();
                    this._glassesOn = !this._glassesOn;
                }
                else if(pickedMesh && this._glassesOn && pickedMesh === this._tableau.getTableau1()) {
                    this._marsVisited = true;
                    this._goToScene0();
                }
                else if(pickedMesh) {
                    const pickedDoor = this._doors.find(door => door.getName() === pickedMesh.name);
                    pickedDoor?.rotateDoor();
                }
            }
        };

        this._scene.onBeforeRenderObservable.add(() => {
            this.stairsCollision();
            if (!this._glassesOn && this.isCameraLookingAtGlasses(this._camera, this._glasses[0])) {
                this._highlightLayer.addMesh(this._glasses[0], Color3.Blue());
                this._glassesVisible = true;
            } else if(!this._glassesOn) {
                this._highlightLayer.removeMesh(this._glasses[0]);
                this._glassesVisible = false;
            }
            if(!this._light.getLightOn() && this._glassesOn) {
                this._tableau.lightUpTableau();
            } else if(this._light.getLightOn()) {
                this._tableau.lightOffTableau();	
            }
        });
    }

    private stairsCollision(): void {
        const camera = this._scene.activeCamera;
        const mesh1 = this._scene.getMeshByName("Collision_1.015");
        const mesh2 = this._scene.getMeshByName("Floor_10.001");
        if(mesh1 && mesh2) {
            if (camera && camera.position.y >= 3) {
                mesh1.checkCollisions = true;
                mesh2.checkCollisions = true;
            } else if(camera && camera.position.y < 3) {
                mesh1.checkCollisions = false;
                mesh2.checkCollisions = false;
                mesh1.isVisible = false;
            }
        }
    }

    private makeGlasses() {
        const parent = this._scene.getNodeByName("OBJ_Glasses");
        const children = parent.getChildMeshes().filter(mesh => mesh instanceof Mesh) as Mesh[];
        this._glasses.push(...children);
    }

    private isCameraLookingAtGlasses(camera, glasses) {
        const cameraPosition = camera.position;
        const meshPosition = glasses.position;
    
        const cameraToMeshDirection = meshPosition.subtract(cameraPosition).normalize();
        const cameraForward = camera.getDirection(Vector3.Forward()).normalize(); 
        const dotProduct = Vector3.Dot(cameraForward, cameraToMeshDirection);
        return dotProduct > 0.5; 
    }

    private putGlasses() {
        this._glasses.forEach(mesh => {
            mesh.isVisible = false;
            console.log(mesh);
        });
    }

    private defineCamPosition() {
        if(!this._marsVisited) {  
            this._camera.position = new Vector3(-1, 4, 4);
            this._camera.target = new Vector3(-5, 1, 10);
        } else {
            this._camera.position = new Vector3(-9.359203794901253, 1.413385730335557, 6.270602252074229);
            this._camera.target = new Vector3(-3.6589336152389382, -3.643423967159632, 7.9839609895837285);
        }
    }
}