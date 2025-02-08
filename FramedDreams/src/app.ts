import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, Vector3, HemisphericLight, ArcRotateCamera, SceneLoader,TransformNode, FreeCamera, Color4, Mesh, MeshBuilder, Matrix, Quaternion, PointLight, Color3, ShadowGenerator }  from "@babylonjs/core";
import { AdvancedDynamicTexture, StackPanel, Button, TextBlock, Rectangle, Control, Image } from "@babylonjs/gui";
import { EnvironmentMain } from "./main_scene/environment_house";
import { Player } from "./characterController";
import { EnvironmentScene0 } from "./scene_0/environment_scene0";

enum State {START = 0, CUT_SCENE = 1, MAIN_SCENE = 2, SCENE_0 = 3}

class App {
    
    private _scene: Scene;
    private _canvas: HTMLCanvasElement;
    private _engine: Engine;

    public assets;
    private _inputMap: {};
    private _environment: EnvironmentMain;
    private _environmentScene0: EnvironmentScene0;
    private _player: Player;

    private _state: number = 0;
    private _mainScene: Scene;
    private _cutScene: Scene;
    private _scene0: Scene;

    constructor() {
        this._canvas = this._createCanvas();
        this._engine = new Engine(this._canvas, true);
        this._scene = new Scene(this._engine);
        this._inputMap = {};

        // hide/show the Inspector
        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
                if (this._scene.debugLayer.isVisible()) {
                    this._scene.debugLayer.hide();
                } else {
                    this._scene.debugLayer.show();
                }
            }

            this._inputMap[ev.code] = ev.type == "keydown"; 
        });

        window.addEventListener("keyup", (ev) => {
            // Store the state of the input.
            this._inputMap[ev.code] = ev.type == "keydown"; // Store key state (pressed or released)
        });

        // run the main render loop
        this._main();
    }

    private async _main(): Promise<void> {
        await this._goToStart();
    
        // Register a render loop to repeatedly render the scene
        this._engine.runRenderLoop(() => {
            switch (this._state) {
                case State.START:
                    this._scene.render();
                    break;
                case State.CUT_SCENE:
                    this._scene.render();
                    break;
                case State.MAIN_SCENE:
                    this._scene.render();
                    if (this._inputMap["KeyM"]) {
                        this._goToScene0();
                        console.log("M pressed");
                        this._inputMap["KeyM"] = false; 
                    }
                    break;
                case State.SCENE_0:
                    this._scene.render();
                    break;
                default: break;
            }
        });
    
        //resize if the screen is resized/rotated
        window.addEventListener('resize', () => {
            this._engine.resize();
        });
    }

    private _createCanvas(): HTMLCanvasElement {

        //Commented out for development
        document.documentElement.style["overflow"] = "hidden";
        document.documentElement.style.overflow = "hidden";
        document.documentElement.style.width = "100%";
        document.documentElement.style.height = "100%";
        document.documentElement.style.margin = "0";
        document.documentElement.style.padding = "0";
        document.body.style.overflow = "hidden";
        document.body.style.width = "100%";
        document.body.style.height = "100%";
        document.body.style.margin = "0";
        document.body.style.padding = "0";

        //create the canvas html element and attach it to the webpage
        this._canvas = document.createElement("canvas");
        this._canvas.style.width = "100%";
        this._canvas.style.height = "100%";
        this._canvas.id = "gameCanvas";
        document.body.appendChild(this._canvas);

        return this._canvas;
    }

    private async _goToStart() {
        this._engine.displayLoadingUI();

        this._scene.detachControl();
        let scene = new Scene(this._engine);
        scene.clearColor = new Color4(0, 0, 0, 1);
        let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), scene);
        camera.setTarget(Vector3.Zero());

        /* 
        MODIFY GUI CODE
        */

        const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        guiMenu.idealHeight = 720; //fit our fullscreen ui to this height

        //create a simple button
        const startBtn = Button.CreateSimpleButton("start", "PLAY");
        startBtn.width = 0.2;
        startBtn.height = "40px";
        startBtn.color = "white";
        startBtn.top = "-14px";
        startBtn.thickness = 0;
        startBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        guiMenu.addControl(startBtn);

        //this handles interactions with the start button attached to the scene
        startBtn.onPointerDownObservable.add(() => {
            this._goToCutScene();
            scene.detachControl(); //observables disabled
        });

        await scene.whenReadyAsync();
        this._engine.hideLoadingUI();
        //lastly set the current state to the start state and set the scene to the start scene
        this._scene.dispose();
        this._scene = scene;
        this._state = State.START;
    }

    private async _goToCutScene(): Promise<void> {
        this._engine.displayLoadingUI();

        this._scene.detachControl();
        this._cutScene = new Scene(this._engine);
        let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), this._cutScene);
        camera.setTarget(Vector3.Zero());
        this._cutScene.clearColor = new Color4(0, 0, 0, 1);

        /* 
        MODIFY GUI CODE
        */

        const cutScene = AdvancedDynamicTexture.CreateFullscreenUI("cutscene");
        let transition = 0; //increment based on dialogue
        let canplay = false;
        let finished_anim = false;
        let anims_loaded = 0;

        //create a simple button
        const skipBtn = Button.CreateSimpleButton("skip", "SKIP");
        skipBtn.fontFamily = "Viga";
        skipBtn.width = "45px";
        skipBtn.left = "-14px";
        skipBtn.height = "40px";
        skipBtn.color = "white";
        skipBtn.top = "14px";
        skipBtn.thickness = 0;
        skipBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        skipBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        cutScene.addControl(skipBtn);

        //--PROGRESS DIALOGUE--
        const next = Button.CreateSimpleButton("next", "NEXT");
        next.color = "white";
        next.thickness = 0;
        next.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        next.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        next.width = "64px";
        next.height = "64px";
        next.top = "-3%";
        next.left = "-12%";
        cutScene.addControl(next);

        next.onPointerUpObservable.add(() => {
            this._goToMainScene();
        });

        //this handles interactions with the start button attached to the scene
        skipBtn.onPointerDownObservable.add(()=> {
            this._cutScene.detachControl();
            this._engine.displayLoadingUI();
            canplay = true;
        });
        
        await this._cutScene.whenReadyAsync();
        this._scene.dispose();
        this._state = State.CUT_SCENE;
        this._scene = this._cutScene;

        //--START LOADING AND SETTING UP THE GAME DURING THIS SCENE--
        var finishedLoading = false;
        await this._setUpGame().then(res =>{
            finishedLoading = true;
        });
    }

    private async _setUpGame() {
        let scene = new Scene(this._engine);
        this._mainScene = scene;
    
        //...load assets
        const environment = new EnvironmentMain(scene);
        this._environment = environment;
        await this._environment.load();

        await this._loadCharacterAssets(scene); //character
    }

    private async _goToMainScene(): Promise<void> {
        this._scene.detachControl();
        let scene = this._mainScene
        scene.clearColor = new Color4(0.01568627450980392, 0.01568627450980392, 0.20392156862745098); // a color that fit the overall color scheme better
        let camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 10, Vector3.Zero(), scene);
        camera.setTarget(Vector3.Zero());
        camera.attachControl(this._canvas, true); 


        //--GUI--
        const playerUI = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        //dont detect any inputs from this ui while the game is loading
        scene.detachControl();

        //primitive character and setting
        await this._initializeGameAsync(scene);

        //--WHEN SCENE FINISHED LOADING--
        await scene.whenReadyAsync();
        //scene.getMeshByName("outer").position = new Vector3(0, 3, 0);

        //temporary scene objects
        var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
        //var sphere: Mesh = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, scene);
        

        //get rid of start scene, switch to gamescene and change states
        this._scene.dispose();
        this._state = State.MAIN_SCENE;
        this._scene = scene;
        this._engine.hideLoadingUI();
        //the game is ready, attach control back
        this._scene.attachControl();
    }

    private async _loadCharacterAssets(scene): Promise<any> {
        async function loadCharacter() {
            //collision mesh
            const outer = MeshBuilder.CreateBox("outer", { width: 2, depth: 1, height: 3 }, scene);
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
            return SceneLoader.ImportMeshAsync(null, "/", "Animation1.glb", scene).then((result) =>{
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
                }
            });
        }

        return loadCharacter().then(assets => {
            this.assets = assets;
        });
    }

    private async _initializeGameAsync(scene): Promise<void> {
        //temporary light to light the entire scene
        var light0 = new HemisphericLight("HemiLight", new Vector3(0, 1, 0), scene);
    
        const light = new PointLight("sparklight", new Vector3(0, 0, 0), scene);
        light.diffuse = new Color3(0.08627450980392157, 0.10980392156862745, 0.15294117647058825);
        light.intensity = 35;
        light.radius = 1;
    
        const shadowGenerator = new ShadowGenerator(1024, light);
        shadowGenerator.darkness = 0.4;

         //Create the player
         this._player = new Player(this.assets, scene, shadowGenerator); //dont have inputs yet so we dont need to pass it in
    
    }

    private async _loadScene0Assets(): Promise<void> {
        let scene = new Scene(this._engine);
        this._scene0 = scene;
        this._environmentScene0 = new EnvironmentScene0(scene);
        await this._environmentScene0.load();
    }

    private async _goToScene0(): Promise<void> {
        this._engine.displayLoadingUI();

        this._scene.detachControl();
        let scene = new Scene(this._engine);
        scene.clearColor = new Color4(0.1, 0.1, 0.3, 1); // Зеленый цвет для SCENE_0
        let freeCam = new FreeCamera("freeCamera", new Vector3(8.8, 13.5, -8.5), scene);
        freeCam.setTarget(new Vector3(-1.5, 0.5, 1)); // Utilisation de 'new' pour le Vector3
        freeCam.attachControl(this._canvas, true);
        freeCam.inertia = 0.5;
        freeCam.angularSensibility = 200; // Sensibilité de la caméra

        // Configurer les touches de mouvement
        freeCam.keysUp.push(90); // Z
        freeCam.keysDown.push(83); // S
        freeCam.keysLeft.push(81); // Q
        freeCam.keysRight.push(68); // D
        let parent = new TransformNode("parent", scene);

        // Add some content to SCENE_0 (temporary)
        //const sphere = MeshBuilder.CreateSphere("sphere1", { diameter: 2 }, scene);
        try {
            let environmentScene0 = new EnvironmentScene0(scene); // Создаем экземпляр EnvironmentScene0
            await environmentScene0.load(); // Загружаем ресурсы

            // Проверяем, что окружение загрузилось
            if (environmentScene0.assets && environmentScene0.assets.meshes) {
                environmentScene0.assets.meshes.forEach(mesh => {
                	// Проверяем чтобы mes существовал
                	if (mesh) {
                    	mesh.parent = parent;
                    	mesh.isPickable = false;
                	}
                });
            } else {
                console.warn("Обьекты для scene 0 загружены не были!");
            }
        }
            catch (error) {
            console.error("Error loading environment for SCENE_0:", error);
        }

        await scene.whenReadyAsync();
        this._engine.hideLoadingUI();
        this._scene.dispose();
        this._scene = scene;
        this._state = State.SCENE_0;
    }


}
new App();