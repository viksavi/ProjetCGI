import { Scene, Mesh, Vector3,HemisphericLight, Tools, Quaternion, Color3,Material, GlowLayer, BoundingInfo, TransformNode, CubeTexture, PhysicsImpostor, SceneLoader, ParticleSystem, Color4, AnimationGroup, MeshBuilder, HDRCubeTexture, StandardMaterial, Texture, PBRMetallicRoughnessMaterial } from "@babylonjs/core";
import {Door} from "./door"
import {Light} from "./light"

export class House {
    private _scene: Scene;
    private _doors: Door[] = [];
    private _light: Light;

    constructor(scene: Scene) {
        this._scene = scene;
        this._light = new Light(this._scene);
        this.findDoors();
    }

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
                else if(pickedMesh) {
                    const pickedDoor = this._doors.find(door => door.getName() === pickedMesh.name);
                    pickedDoor?.rotateDoor();
                }
            }
        };
    }
}