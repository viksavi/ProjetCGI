import { AbstractModelScene } from "../baseScenes/abstractModelScene";
import { Engine, FreeCamera, Vector3, PointerEventTypes, ActionManager, ExecuteCodeAction, TransformNode,Tools, SpotLight, Material,PBRMetallicRoughnessMaterial, GlowLayer, ShadowGenerator,  Color4, CannonJSPlugin, Ray, PhysicsImpostor, StandardMaterial, Texture,  Mesh, MeshBuilder, HDRCubeTexture, Matrix, Quaternion, AssetContainer, SceneLoader, DirectionalLight,  HemisphericLight, PointLight, Color3, UniversalCamera } from "@babylonjs/core";
import { Player } from "../../characterController";
import * as GUI from "@babylonjs/gui";
import { EnvironmentMain } from "../../environments/environmentMain";
import { House } from "../../house/house";

export class MainScene extends AbstractModelScene { 
    public environment: EnvironmentMain = new EnvironmentMain(this._scene);
    public player: Player;
    public assets: any;
    private _sceneReady: boolean = false;
    private _house: House;
    private _canvas: HTMLCanvasElement;
    private _camera: FreeCamera;

    constructor(engine: Engine, goToScene0: () => void, canvas: HTMLCanvasElement) {
        super(engine);
        this._goToScene0 = goToScene0;
        this._canvas = canvas;
    }

    private _goToScene0: () => void; //dependency injection

    public async load(): Promise<any> {
        this._scene.clearColor = new Color4(0.01568627450980392, 0.01568627450980392, 0.20392156862745098);
        this._camera = new FreeCamera("camera1", new Vector3(-1, 1.5, 8), this._scene);
        this._camera.setTarget(new Vector3(0, 2, 10));
        this._camera.speed = 0.6;
        this._camera.inertia = 0.5; 
        this._camera.angularSensibility = 2000;
        this._camera.attachControl(this._canvas, true);
        this._camera.keysUp.push(87);   // W
        this._camera.keysDown.push(83); // S
        this._camera.keysLeft.push(65); // A
        this._camera.keysRight.push(68);  // D
        this._camera.keysUp.push(90);   // Z (AZERTY)
        this._camera.keysLeft.push(81); // Q (AZERTY)

        this._scene.activeCamera = this._camera;

        const assumedFramesPerSecond = 60;
        const earthGravity = -9.81;
        this._scene.gravity = new Vector3(0, earthGravity / assumedFramesPerSecond, 0);
        this._camera.applyGravity = true;
        this._camera.ellipsoid = new Vector3(0.4, 1, 0.4);
        this._camera.ellipsoidOffset = new Vector3(0, 0.7, 0);
        this._camera.minZ = 0.45;
        (this._camera as any).slopFactor = 1.5;

        const crosshair = new GUI.Ellipse();
        crosshair.width = "8px"; 
        crosshair.height = "8px";
        crosshair.color = "white"; 
        crosshair.thickness = 1; 
        crosshair.background = "white"; 
        crosshair.alpha = 1; 
        crosshair.left = "0px";
        crosshair.top = "0px";
        crosshair.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        crosshair.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;

    
        this.ui.addControl(crosshair);

        this._scene.collisionsEnabled = true;
        this._camera.checkCollisions = true;
        if (this._camera.inputs.attached.mouse) {
            this._camera.inputs.attached.mouse.detachControl();
        }
        this.initCameraControl(this._canvas, this._camera);
        
        await this.environment.load();
        await this._loadCharacterAssets();
        this.environment.enableCollisions();
        this._house = new House(this._scene, this._camera, this._goToScene0);
        this._onSceneReady();
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

    private _onSceneReady(): void {
        this._sceneReady = true;
        this._scene.onBeforeRenderObservable.add(() => {
            this.stairsCollision();
            console.log("scene ready");
        });
        this._house.onPointerDownEvts();
    }

    private stairsCollision(): void {
        const camera = this._scene.activeCamera;
        const mesh1 = this._scene.getMeshByName("Collision_1.015");
        const mesh2 = this._scene.getMeshByName("Floor_10.001");
        if(mesh1 && mesh2) {
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

    private initCameraControl(canvas: HTMLCanvasElement, camera: FreeCamera): void {
        const rotationSpeed = 0.005;
    
        const lockPointer = () => {
            canvas.requestPointerLock = canvas.requestPointerLock || (canvas as any).mozRequestPointerLock || (canvas as any).webkitRequestPointerLock;
            if (canvas.requestPointerLock) {
                canvas.requestPointerLock();
            }
        };
    
        this._scene.onPointerObservable.add((pointerInfo) => {
            if (document.pointerLockElement === canvas) {
                switch (pointerInfo.type) {
                    case PointerEventTypes.POINTERMOVE:
                        const event = pointerInfo.event as MouseEvent;
                        const deltaX = event.movementX || 0;
                        const deltaY = event.movementY || 0;
    
                        camera.rotation.y += deltaX * rotationSpeed;
                        camera.rotation.x += deltaY * rotationSpeed;
                        camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
                        break;
                }
            }
        });
    
        canvas.addEventListener("click", lockPointer);
    
        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement !== canvas) {
                console.log("Pointer Lock потерян");
            }
        });

        canvas.addEventListener("contextmenu", (evt) => {
            evt.preventDefault();
        }, false);
    }
}