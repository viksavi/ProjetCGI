import { Scene, Mesh, Vector3,HemisphericLight, Tools, Quaternion, Color3,Material, GlowLayer, BoundingInfo, TransformNode, CubeTexture, PhysicsImpostor, SceneLoader, ParticleSystem, Color4, AnimationGroup, MeshBuilder, HDRCubeTexture, StandardMaterial, Texture, PBRMetallicRoughnessMaterial } from "@babylonjs/core";

export class Door {
    private _scene: Scene;
    private _hinge: TransformNode;
    private _doorOpened: boolean = false;
    private _doorName: String;

    constructor(scene: Scene, door: Mesh) {
        this._scene = scene;
        this._hinge = door.parent as TransformNode;
        this._doorName = door.name;
    }

    public getName(): String {
        return this._doorName;
    }

    public rotateDoor(): void {
            this._doorOpened = !this._doorOpened;
            const targetRotationDegrees = this._doorOpened ? 90 : 0;
            const targetRotationRadians = Tools.ToRadians(targetRotationDegrees);
            const targetQuaternion = Quaternion.RotationAxis(Vector3.Up(), targetRotationRadians);
            this._hinge.rotationQuaternion = targetQuaternion;
    }
}