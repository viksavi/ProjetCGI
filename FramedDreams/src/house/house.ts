import { Scene, Mesh, Vector3,HemisphericLight, HighlightLayer, UniversalCamera, Tools, Quaternion, Color3,Material, GlowLayer, BoundingInfo, TransformNode, CubeTexture, PhysicsImpostor, SceneLoader, ParticleSystem, Color4, AnimationGroup, MeshBuilder, HDRCubeTexture, StandardMaterial, Texture, PBRMetallicRoughnessMaterial } from "@babylonjs/core";
import {Door} from "./door"
import {Light} from "./light"

export class House {
    private _scene: Scene;
    private _doors: Door[] = [];
    private _light: Light;
    private _glasses: Mesh[] = [];
    private _highlightLayer: HighlightLayer;
    private _camera: UniversalCamera;
    private _glassesVisible: boolean = false;
    private _glassesOn: boolean = false;
    private _tableau1: Mesh;

    constructor(scene: Scene, camera: UniversalCamera, goToScene0: () => void) {
        this._scene = scene;
        this._camera = camera;
        this._light = new Light(this._scene);
        this.findDoors();
        this._highlightLayer = new HighlightLayer("hl1", this._scene);
        this.makeGlasses();
        this._tableau1 = this._scene.getMeshByName("Martian_tableau") as Mesh;
        this._goToScene0 = goToScene0;
    }

    private _goToScene0: () => void;

    private findDoors() {
        this._scene.meshes.forEach(mesh => {
            if (mesh.name.includes("Door")) {
                this._doors.push(new Door(this._scene, mesh as Mesh));
            }
        });
    }

    public onPointerDownEvts() {
        this._scene.onPointerDown = (evt, pickInfo) => {
            if (pickInfo.hit) {
                const pickedMesh = pickInfo.pickedMesh;
        
                if (pickedMesh && this._light.getSwitches().some(mesh => mesh === pickedMesh)) { 
                    this._light.changeLightState(pickedMesh);
                }
                else if(this._glassesVisible && this._glasses.some(mesh => mesh === pickedMesh)) {
                    this.putGlasses();
                    console.log("glasses clicked");
                    this._glassesOn = !this._glassesOn;
                }
                else if(pickedMesh && this._glassesOn && pickedMesh === this._tableau1) {
                    this._goToScene0();
                }
                else if(pickedMesh) {
                    const pickedDoor = this._doors.find(door => door.getName() === pickedMesh.name);
                    pickedDoor?.rotateDoor();
                }
            }
        };

        this._scene.onBeforeRenderObservable.add(() => {
            if (!this._glassesOn && this.isCameraLookingAtGlasses(this._camera, this._glasses[0])) {
                this._highlightLayer.addMesh(this._glasses[0], Color3.Blue());
                this._glassesVisible = true;
            } else if(!this._glassesOn) {
                this._highlightLayer.removeMesh(this._glasses[0]);
                this._glassesVisible = false;
            }
        });
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
        this._tableau1.isVisible = true;
    }
}