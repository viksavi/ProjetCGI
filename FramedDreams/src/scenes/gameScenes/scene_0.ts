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

    constructor(engine: Engine) {
        super(engine);
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
    
    }

    public async load(): Promise<void> {
        this._scene.clearColor = new Color4(0.1, 0.1, 0.3, 1);

        // Configuration de la caméra (inchangée)
        this._camera = new UniversalCamera("cam", new Vector3(8.8, 13.5, -8.5), this._scene);
        this._camera.setTarget(new Vector3(-1.5, 0.5, 1));
        this._camera.attachControl(this._engine.getRenderingCanvas(), true);
        this._camera.inertia = 0.5;
        this._camera.angularSensibility = 200;


        this._hemiLight = new HemisphericLight("hemiLight", new Vector3(0, 1, 0), this._scene);
        this._hemiLight.intensity = 1;

        this._direcLight = new DirectionalLight("direcLight", new Vector3(-12, -13, 4), this._scene);
        this._direcLight.intensity = 1.5;

        await this.environment.load();
        await this._loadCharacterAssets();
        // Création et positionnement du joueur APRES le chargement des assets
        if (this.assets && this.assets.mesh && this.assets.animationGroups) {
            // Préparer les paramètres du joueur
            const playerParams = {
                mesh: this.assets.mesh,
                animationGroups: this.assets.animationGroups, // Inclure les animationGroups
                scene: this._scene
            };

            // Créer le joueur avec les paramètres
            this.player = new Player(playerParams, this._scene);
            this._camera = this.player.activatePlayerCamera();

            // Ajout pour le débogage :
            console.log("Position initiale du joueur :", this.player.position);
        } else {
            console.warn("Erreur: Assets du personnage non chargés correctement.");
        }

        this._mars = new Mars(this._scene, this.player.mesh);
        this._onSceneReady();
    }

    private _onSceneReady(): void {
        this._scene.onBeforeRenderObservable.add(() => {
            this._mars.marsEvents();
        });
    }
  

    protected async _loadCharacterAssets(): Promise<void> {
        const loadCharacter = async () => {
            //collision mesh
            const outer = MeshBuilder.CreateBox("outer", { width: 0.5, depth: 0.5, height: 1 }, this._scene);
            outer.isVisible = false;
            outer.isPickable = false;
            outer.checkCollisions = true;
            outer.showBoundingBox = false;
            outer.position = new Vector3(5.50, 0.07, 2.78);
            	

            //move origin of box collider to the bottom of the mesh (to match player mesh)
            outer.bakeTransformIntoVertices(Matrix.Translation(0, 0.5, 0))
            //for collisions
            outer.ellipsoid = new Vector3(0.5, 0.5, 0.5);
            outer.ellipsoidOffset = new Vector3(0, 0.5, 0);

            outer.rotationQuaternion = new Quaternion(0, 1, 0, 0); // rotate the player mesh 180 since we want to see the back of the player

            //--IMPORTING MESH--
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

                //return the mesh and animations
                return {
                    mesh: outer as Mesh,
                    animationGroups: result.animationGroups
                };
            });
        }

        this.assets = await loadCharacter(); // Assignation directe des assets
    }

    public dispose(): void {
        this._scene.dispose();
    }
}