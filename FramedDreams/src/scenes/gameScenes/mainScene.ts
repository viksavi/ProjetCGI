import { AbstractModelScene } from "../baseScenes/abstractModelScene";
import { Engine, FreeCamera, Vector3, Color4, CannonJSPlugin, Ray, PhysicsImpostor, StandardMaterial, Texture,  Mesh, MeshBuilder, HDRCubeTexture, Matrix, Quaternion, AssetContainer, SceneLoader, DirectionalLight,  HemisphericLight, PointLight, Color3, UniversalCamera } from "@babylonjs/core";
import { Player } from "../../characterController";
import { EnvironmentMain } from "../../environments/environmentMain";

export class MainScene extends AbstractModelScene { 
    public environment: EnvironmentMain = new EnvironmentMain(this._scene);
    public player: Player;
    public assets: any;
    private _hemiLight: HemisphericLight;
    private _pointLight: PointLight;

    constructor(engine: Engine, goToScene0: () => void) {
        super(engine);
        this._goToScene0 = goToScene0; 
    }

    private _goToScene0: () => void; //dependency injection

    public async load(): Promise<any> {
        
        this._hemiLight = new HemisphericLight("hemiLight", new Vector3(0, 1, 0), this._scene);
        this._hemiLight.intensity = 0.7;

        this._pointLight = new PointLight("pointLight", new Vector3(0, 5, 0), this._scene);
        this._pointLight.intensity = 50;
        this._pointLight.diffuse = new Color3(1, 1, 1);
        this._pointLight.specular = new Color3(1, 1, 1);

        this._scene.clearColor = new Color4(0.01568627450980392, 0.01568627450980392, 0.20392156862745098);
        let camera = new UniversalCamera("camera1", new Vector3(-1, 1.5, 8), this._scene);
        camera.setTarget(new Vector3(0, 2, 10));
        camera.speed = 0.6;
        camera.inertia = 0.5; 
        camera.attachControl(true);

        this._scene.activeCamera = camera;

        const assumedFramesPerSecond = 60;
        const earthGravity = -9.81;
        this._scene.gravity = new Vector3(0, earthGravity / assumedFramesPerSecond, 0);
        camera.applyGravity = true;
        camera.ellipsoid = new Vector3(0.5, 1, 0.5);
        camera.ellipsoidOffset = new Vector3(0, 0.7, 0);
        camera.minZ = 0.45;
        (camera as any).slopFactor = 1.5;

        this._scene.collisionsEnabled = true;
        camera.checkCollisions = true;
        
        await this.environment.load();
        await this._loadCharacterAssets();

        this.environment.enableCollisions();
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

    public goToScene0() {
        this._goToScene0();
    }

    public stairsCollision(): void {
        const camera = this._scene.activeCamera;
        const mesh1 = this._scene.getMeshByName("Collision_1.015");
        const mesh2 = this._scene.getMeshByName("Floor_10.001");

        if (camera && camera.position.y >= 3) {
            mesh1.checkCollisions = true;
            mesh2.checkCollisions = true;
        } else if(camera && camera.position.y < 3) {
            mesh1.checkCollisions = false;
            mesh2.checkCollisions = false;
            mesh1.isVisible = false;
        }
    }

}