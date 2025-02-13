import { AbstractModelScene } from "../baseScenes/abstractModelScene";
import { Engine, FreeCamera, Vector3, Color4, StandardMaterial, Texture,  Mesh, MeshBuilder, HDRCubeTexture, Matrix, Quaternion, AssetContainer, SceneLoader, DirectionalLight,  HemisphericLight, PointLight, Color3, UniversalCamera } from "@babylonjs/core";
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
        let camera = new UniversalCamera("camera1", new Vector3(0, 2, 9), this._scene);
        camera.setTarget(new Vector3(2, 3, 10));
        camera.speed = 0.4;
        camera.inertia = 0.7; 
        camera.attachControl(true);

        this._scene.activeCamera = camera;
        const assumedFramesPerSecond = 60;
        const earthGravity = -9.81;
        this._scene.gravity = new Vector3(0,  earthGravity / assumedFramesPerSecond, 0);
        //camera.applyGravity = true;
        camera.ellipsoid = new Vector3(1, 1, 1);
        this._scene.collisionsEnabled = true;
        //camera.checkCollisions = true;

        const hdrTexture = new HDRCubeTexture("/meadow_2_2k.hdr", this._scene, 512);
    	this._scene.environmentTexture = hdrTexture;
        const skybox = MeshBuilder.CreateBox("skyBox", { size: 1000 }, this._scene);
        const skyboxMaterial = new StandardMaterial("skyBoxMaterial", this._scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = hdrTexture;
        skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
        skyboxMaterial.specularColor = new Color3(0, 0, 0);
        skybox.material = skyboxMaterial;
        this._scene.environmentIntensity = 0.1;
        
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

}