import { AbstractModelScene } from "../baseScenes/abstractModelScene";
import { Engine, FreeCamera, Vector3, Color4, Mesh, MeshBuilder, Matrix, Color3, Quaternion, SceneLoader, TransformNode, HemisphericLight, PointLight } from "@babylonjs/core";
import { Player } from "../../characterController";
import { EnvironmentScene0 } from "../../environments/environment_scene0";

export class Scene0 extends AbstractModelScene {
    public environment: EnvironmentScene0 = new EnvironmentScene0(this._scene);
    public player: Player;
    public assets: any;
    private _hemiLight: HemisphericLight;
    private _pointLight: PointLight;

    constructor(engine: Engine, playerData: { position: Vector3, rotation: Quaternion } | null) {
        super(engine);
        this._playerData = playerData;
    }

    private _playerData: { position: Vector3, rotation: Quaternion } | null;

    public async load(): Promise<void> {
        this._scene.clearColor = new Color4(0.1, 0.1, 0.3, 1);
        let freeCam = new FreeCamera("freeCamera", new Vector3(8.8, 13.5, -8.5), this._scene);
        freeCam.setTarget(new Vector3(-1.5, 0.5, 1));
        freeCam.attachControl(this._engine.getRenderingCanvas(), true);
        freeCam.inertia = 0.5;
        freeCam.angularSensibility = 200;

        freeCam.keysUp.push(90);
        freeCam.keysDown.push(83);
        freeCam.keysLeft.push(81);
        freeCam.keysRight.push(68);

        this._hemiLight = new HemisphericLight("hemiLight", new Vector3(0, 1, 0), this._scene);
        this._hemiLight.intensity = 0.7;

        this._pointLight = new PointLight("pointLight", new Vector3(0, 5, 0), this._scene);
        this._pointLight.intensity = 50;
        this._pointLight.diffuse = new Color3(1, 1, 1);
        this._pointLight.specular = new Color3(1, 1, 1);

        if (this.player && this.player.mesh && this._playerData) {
            this.player.mesh.position = this._playerData.position.add(new Vector3(0, 0, 3));
            this.player.mesh.rotationQuaternion = this._playerData.rotation;
        }

        await this.environment.load();
        await this._loadCharacterAssets();
    }

    protected async _loadCharacterAssets(): Promise<any> {
        const loadCharacter = async () => {
            //collision mesh
            const outer = MeshBuilder.CreateBox("outer", { width: 2, depth: 1, height: 3 }, this._scene);
            outer.isVisible = false;
            outer.isPickable = false;
            outer.checkCollisions = true;

            //move origin of box collider to the bottom of the mesh (to match player mesh)
            outer.bakeTransformIntoVertices(Matrix.Translation(0, 1.5, 0))
            //for collisions
            outer.ellipsoid = new Vector3(1, 1.5, 1);
            outer.ellipsoidOffset = new Vector3(0, 1.5, 0);

            outer.rotationQuaternion = new Quaternion(0, 1, 0, 0); // rotate the player mesh 180 since we want to see the back of the player
            
            //--IMPORTING MESH--
            return SceneLoader.ImportMeshAsync(null, "/", "Animation1.glb", this._scene).then((result) =>{
                const root = result.meshes[0];
                //body is our actual player mesh
                const body = root;
                body.parent = outer;
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

        return loadCharacter().then(assets => {
            this.assets = assets;
        });
    }

    public dispose(): void {
        this._scene.dispose();
    }
}