import { Scene, Mesh, Vector3,HemisphericLight, Color3,Material, GlowLayer, StandardMaterial } from "@babylonjs/core";

export class Light {
    private _scene: Scene;
    private _switches: Mesh[] = [];
    private _lightOn: boolean = true;
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

    public getLightOn(): boolean {
        return this._lightOn;   
    }

    public getSwitches(): Mesh[] {
        return this._switches;
    }

    private findSwitches(): void {
        this._scene.meshes.forEach(mesh => {
            if (mesh.name.includes("OBJ_SwitchLight")) {
                this._switches.push(mesh as Mesh);
            }
        });
    }

    public changeLightState(meshSwitch): void {
        if(!this._lightOn) {
            if(this._glowLayer) {
                this._glowLayer.dispose();
                this._glowLayer = null;
                meshSwitch.material.emissiveColor = new Color3(0, 0, 0);
                meshSwitch.material = this._origMaterial;
            }
            this._hemiLight.setEnabled(true);
            this._lightOn = true;
        } else {
            this._hemiLight.setEnabled(false);
            const material = new StandardMaterial("glowMaterial", this._scene);
            this._glowLayer = new GlowLayer("glow", this._scene);
            this._glowLayer.intensity = 0.01; 
            material.emissiveColor = new Color3(0.8, 0.8, 0.8); 
            meshSwitch.material = material;
            this._lightOn = false;
        } 
    }

}