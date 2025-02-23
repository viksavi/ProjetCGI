import { Scene, Mesh, Vector3,HemisphericLight, Color3,Material, GlowLayer, BoundingInfo, TransformNode, CubeTexture, PhysicsImpostor, SceneLoader, ParticleSystem, Color4, AnimationGroup, MeshBuilder, HDRCubeTexture, StandardMaterial, Texture, PBRMetallicRoughnessMaterial } from "@babylonjs/core";

export class Light {
    public _scene: Scene;
    public switches: Mesh[] = [];
    public lightOn: boolean = true;
    private _glowLayer: GlowLayer;
    private _origMaterial: Material;
    private _hemiLight: HemisphericLight;

    constructor(scene: Scene) {
        this._scene = scene;
        this.findSwitches();
        this._origMaterial = this._scene.getMeshByName("OBJ_SwitchLight.003").material;
        this._hemiLight = new HemisphericLight("light", new Vector3(0, 1, 0), this._scene);
        this._hemiLight.intensity = 0.6;
        this._hemiLight.groundColor = new Color3(0.22, 0.21, 0.20); 
        this._hemiLight.diffuse = new Color3(0.82, 0.81, 0.78); 
    }

    private findSwitches(): void {
        this._scene.meshes.forEach(mesh => {
            if (mesh.name.includes("OBJ_SwitchLight")) {
                this.switches.push(mesh as Mesh);
            }
        });
    }

    public toggleLight(): void {
        this._scene.onPointerDown = (evt, pickInfo) => {
            if (pickInfo.hit) {
                const pickedMesh = pickInfo.pickedMesh;
        
                if (pickedMesh && this.switches.some(mesh => mesh === pickedMesh)) { 
                    this.changeLightState(pickedMesh);
                }
            }
        };
    }

    private changeLightState(meshSwitch): void {
        if(!this.lightOn) {
            if(this._glowLayer) {
                this._glowLayer.dispose();
                this._glowLayer = null;
                meshSwitch.material.emissiveColor = new Color3(0, 0, 0);
                meshSwitch.material = this._origMaterial;
            }
            this._hemiLight.setEnabled(true);
            this.lightOn = true;
            const lamp1 = this._scene.getMeshByName("OBJ_Light_01");
        } else {
            this._hemiLight.setEnabled(false);
            const material = new StandardMaterial("glowMaterial", this._scene);
            this._glowLayer = new GlowLayer("glow", this._scene);
            this._glowLayer.intensity = 0.01; 
            material.emissiveColor = new Color3(0.8, 0.8, 0.8); 
            meshSwitch.material = material;
            this.lightOn = false;
        } 
    }

}