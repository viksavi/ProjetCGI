import { Scene, Mesh, Vector3, HemisphericLight, Color3, Material, GlowLayer, StandardMaterial } from "@babylonjs/core";

/**
 * Classe représentant un système d’éclairage avec interrupteurs dans la scène.
 * Permet d’activer/désactiver la lumière ambiante et d’appliquer un effet lumineux sur les interrupteurs.
 */
export class Light {
    /** Scène Babylon.js */
    private _scene: Scene;

    /** Liste des meshes représentant les interrupteurs (switches) */
    private _switches: Mesh[] = [];

    /** Indique si la lumière est allumée */
    private _lightOn: boolean = true;

    /** Effet Glow utilisé pour simuler l’interrupteur allumé */
    private _glowLayer: GlowLayer;

    /** Matériau d’origine de l’interrupteur */
    private _origMaterial: Material;

    /** Lumière hémisphérique principale de la scène */
    private _hemiLight: HemisphericLight;

    /**
     * Initialise le système d’éclairage dans la scène.
     * @param scene - Scène Babylon.js
     */
    constructor(scene: Scene) {
        this._scene = scene;
        this.findSwitches();
        this._origMaterial = this._scene.getMeshByName("OBJ_SwitchLight.003").material;
        this._hemiLight = new HemisphericLight("light", new Vector3(0, 1, 0), this._scene);
        this._hemiLight.intensity = 0.6;
        this._hemiLight.groundColor = new Color3(0.22, 0.21, 0.20); 
        this._hemiLight.diffuse = new Color3(0.82, 0.81, 0.78); 
    }

    /**
     * Retourne l’état actuel de la lumière.
     * @returns true si la lumière est allumée
     */
    public getLightOn(): boolean {
        return this._lightOn;   
    }

    /**
     * Retourne la liste des interrupteurs détectés dans la scène.
     * @returns Tableau de meshes
     */
    public getSwitches(): Mesh[] {
        return this._switches;
    }

    /**
     * Recherche tous les interrupteurs dans la scène (par nom de mesh).
     */
    private findSwitches(): void {
        this._scene.meshes.forEach(mesh => {
            if (mesh.name.includes("OBJ_SwitchLight")) {
                this._switches.push(mesh as Mesh);
            }
        });
    }

    /**
     * Change l’état de la lumière (on/off) et met à jour le visuel de l’interrupteur.
     * @param meshSwitch - Le mesh représentant l’interrupteur à mettre à jour
     */
    public changeLightState(meshSwitch): void {
        if (!this._lightOn) {
            // Allumer la lumière
            if (this._glowLayer) {
                this._glowLayer.dispose();
                this._glowLayer = null;
                meshSwitch.material.emissiveColor = new Color3(0, 0, 0);
                meshSwitch.material = this._origMaterial;
            }
            this._hemiLight.setEnabled(true);
            this._lightOn = true;
        } else {
            // Éteindre la lumière
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
