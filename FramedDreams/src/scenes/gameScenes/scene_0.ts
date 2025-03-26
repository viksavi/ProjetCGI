import { AbstractModelScene } from "../baseScenes/abstractModelScene";
import { Engine, FreeCamera, Vector3, Color4, Mesh,CubeTexture, MeshBuilder, Matrix, Quaternion, SceneLoader, HemisphericLight, DirectionalLight, AnimationGroup, ActionManager, ExecuteCodeAction, UniversalCamera } from "@babylonjs/core";
import { Player } from "../../mars/character/characterController";
import { EnvironmentScene0 } from "../../environments/environment_scene0";
import { Mars } from "../../mars/mars";

export class Scene0 extends AbstractModelScene {
    public environment: EnvironmentScene0 = new EnvironmentScene0(this._scene);
    public player: Player;
    public assets: any;
    private _hemiLight: HemisphericLight;
    private _direcLight: DirectionalLight;
    private _camera: UniversalCamera;
    private _mars: Mars;
    private goToMainScene: () => void

    constructor(engine: Engine, goToMainScene: () => void) {
        super(engine);
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }

        this.goToMainScene = goToMainScene;
    }

    public async load(): Promise<void> {
        this._scene.clearColor = new Color4(0.1, 0.1, 0.3, 1);

        this._camera = new UniversalCamera("cam", new Vector3(8.8, 13.5, -8.5), this._scene);
        this._camera.attachControl(this._engine.getRenderingCanvas(), true);

        this._hemiLight = new HemisphericLight("hemiLight", new Vector3(0, 1, 0), this._scene);
        this._hemiLight.intensity = 1;

        this._direcLight = new DirectionalLight("direcLight", new Vector3(-12, -13, 4), this._scene);
        this._direcLight.intensity = 1.5;

        await this.environment.load();
        await this._loadCharacterAssets();
        if (this.assets && this.assets.mesh && this.assets.animationGroups) {
            const playerParams = {
                mesh: this.assets.mesh,
                animationGroups: this.assets.animationGroups,
                scene: this._scene
            };

            this.player = new Player(playerParams, this._scene);
            this._camera = this.player.activatePlayerCamera();

            console.log("Position initiale du joueur :", this.player.position);
        } else {
            console.warn("Erreur: Assets du personnage non chargés correctement.");
        }

        this._mars = new Mars(this._scene, this.player, this.goToMainScene);
    }


    protected async _loadCharacterAssets(): Promise<void> {
        const loadCharacter = async () => {
            const outer = MeshBuilder.CreateBox("outer", { width: 0.5, depth: 0.5, height: 1 }, this._scene);
            outer.isVisible = false;
            outer.isPickable = false;
            outer.checkCollisions = true;
            outer.showBoundingBox = false;
            outer.position = new Vector3(4.5, 0, 2.5);
            	
            outer.bakeTransformIntoVertices(Matrix.Translation(0, 0.5, 0))
            outer.ellipsoid = new Vector3(0.5, 0.5, 0.5);
            outer.ellipsoidOffset = new Vector3(0, 0.5, 0);

            outer.rotationQuaternion = Quaternion.FromEulerAngles(0, Math.PI / 2, 0);

            return SceneLoader.ImportMeshAsync(null, "/models/characters/", "astronaute.glb", this._scene).then((result) => {
                const root = result.meshes[0];
                const body = root;
                body.scaling = new Vector3(7, 7, 7),
                body.parent = outer;
                body.position = Vector3.Zero();
                body.isPickable = false;
                body.getChildMeshes().forEach(m => {
                    m.isPickable = false;
                })

                return {
                    mesh: outer as Mesh,
                    animationGroups: result.animationGroups
                };
            });
        }

        this.assets = await loadCharacter(); // Assignation directe des assets
    }

    public dispose(): void {
        console.log("Disposing Scene0");
        this._scene.onBeforeRenderObservable.clear();
        this._scene.onAfterRenderObservable.clear();
        this._scene.onKeyboardObservable.clear();

        if (this._mars && this._mars._advancedTexture) {
            this._mars._advancedTexture.dispose();
        }

        this._scene.meshes.forEach(mesh => {
            mesh.dispose();
        });

        this._scene.lights.forEach(light => {
            light.dispose();
        });

        this._scene.cameras.forEach(camera => {
            camera.dispose();
        });

        this._scene.materials.forEach(material => {
            material.dispose();
        });

        this._scene.textures.forEach(texture => {
            texture.dispose();
        });

        if (this.assets && this.assets.animationGroups) {
            this.assets.animationGroups.forEach(animationGroup => {
                animationGroup.stop();
                animationGroup.dispose();
            });
        }
        if (this._scene.actionManager) {
            this._scene.actionManager.dispose();
        }
        if (this.environment) {
            this.environment.dispose();
        }
        if (this.player) {
            this.player.mesh.dispose();
        }
        this._scene.dispose();
        console.log("Scene0 Disposed");
    }
}
