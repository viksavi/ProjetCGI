import { Scene, Mesh, Vector3, FreeCamera,  HighlightLayer, Color3, GlowLayer, StandardMaterial, Texture, UniversalCamera, TransformNode } from "@babylonjs/core";

export class Mars {
    private _scene: Scene;
    private _camera: UniversalCamera;
    private _antenne1: Mesh[] = [];

    constructor(scene: Scene, camera: UniversalCamera) {
        this._scene = scene;
        this._camera = camera;
        this.findAntenne1();
    }

    public marsEvents() {
        this._scene.onPointerDown = (evt, pickInfo) => {
            if (pickInfo.hit) {
                const pickedMesh = pickInfo.pickedMesh;

                if(this._antenne1.some(mesh => mesh === pickedMesh)) {
                    console.log("antenne1 clicked");
                    console.log(this._antenne1[0].position);
                }
            }
        };
    }

    private findAntenne1() {
        const parent = this._scene.getNodeByName("antenne1") as TransformNode;
        console.log("Coordonées: " + parent.getAbsolutePosition());
        const children = parent.getChildMeshes().filter(mesh => mesh instanceof Mesh) as Mesh[];
        this._antenne1.push(...children);
    }
}