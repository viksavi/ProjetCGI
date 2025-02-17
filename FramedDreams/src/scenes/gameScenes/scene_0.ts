import { AbstractModelScene } from "../baseScenes/abstractModelScene";
import { Engine, FreeCamera, Vector3, Color4, Mesh, MeshBuilder, Matrix, Quaternion, SceneLoader, HemisphericLight, DirectionalLight, AnimationGroup, ActionManager, ExecuteCodeAction } from "@babylonjs/core";
import { Player } from "../../characterController";
import { EnvironmentScene0 } from "../../environments/environment_scene0";

export class Scene0 extends AbstractModelScene {
    public environment: EnvironmentScene0 = new EnvironmentScene0(this._scene);
    public player: Player;
    public assets: any;
    private _hemiLight: HemisphericLight;
    private _direcLight: DirectionalLight;
    private _walkAnimation: AnimationGroup | undefined;
    private _runAnimation: AnimationGroup | undefined;
    private _idleAnimation: AnimationGroup | undefined;
    private _walkSpeed: number = 0.08; // Vitesse de déplacement

    constructor(engine: Engine, playerData: { position: Vector3, rotation: Quaternion } | null) {
        super(engine);
        this._playerData = playerData;
    }

    private _playerData: { position: Vector3, rotation: Quaternion } | null;

    public async load(): Promise<void> {
        this._scene.clearColor = new Color4(0.1, 0.1, 0.3, 1);

        // Configuration de la caméra (inchangée)
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
        this._hemiLight.intensity = 1;

        this._direcLight = new DirectionalLight("direcLight", new Vector3(12, 13, -4), this._scene);
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
            this.player = this.createPlayer(playerParams);
            this._walkAnimation = this.assets.animationGroups.find(ag => ag.name === "walk");
            this._runAnimation = this.assets.animationGroups.find(ag => ag.name === "run");
            this._idleAnimation = this.assets.animationGroups.find(ag => ag.name === "idle");

            // Ajout pour le débogage :
            console.log("Position initiale du joueur :", this.player.position);
            console.log("Echelle du joueur :", this.player.scaling);
        } else {
            console.warn("Erreur: Assets du personnage non chargés correctement.");
        }

        this._setupInput(); // Mise en place des contrôles après la création du joueur
    }

    //Fonction qui permet de créer le player
    private createPlayer(params: any): Player {
        const player = new Player(params);
        return player;
    }

    protected async _loadCharacterAssets(): Promise<void> {
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
            return SceneLoader.ImportMeshAsync(null, "/", "lostronaut.glb", this._scene).then((result) => {
                const root = result.meshes[0];
                //body is our actual player mesh
                const body = root;
                body.scaling = new Vector3(13, 13, 13),
                body.position = new Vector3(2.3, 0, 2);
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

        this.assets = await loadCharacter(); // Assignation directe des assets
    }

    private _setupInput(): void {
        // ActionManager pour la gestion des événements clavier
        this._scene.actionManager = new ActionManager(this._scene);

        // Action pour démarrer l'animation "walk" et le déplacement vers l'arrière
        this._scene.actionManager.registerAction(
            new ExecuteCodeAction(
                { trigger: ActionManager.OnKeyDownTrigger, parameter: 'x' }, // Touche "s" (peut être modifiée)
                () => {
                    if (this._walkAnimation) {
                        this._walkAnimation.start(true); // Démarrer l'animation en boucle
                        this._moveCharacterBack(); // Déclencher le déplacement du personnage
                    }
                }
            )
        );
        this._scene.actionManager.registerAction(
            new ExecuteCodeAction(
                { trigger: ActionManager.OnKeyUpTrigger, parameter: 'x' }, // Touche "s" relâchée
                () => {
                    if (this._walkAnimation) {
                        this._walkAnimation.stop();
                    }
                }
            )
        );

        // Action pour démarrer l'animation "walk" et le déplacement vers l'avant
        this._scene.actionManager.registerAction(
            new ExecuteCodeAction(
                { trigger: ActionManager.OnKeyDownTrigger, parameter: 'w' }, // Touche "w" (peut être modifiée)
                () => {
                    if (this._walkAnimation) {
                        this._walkAnimation.start(true); // Démarrer l'animation en boucle
                        this._moveCharacterFront(); // Déclencher le déplacement du personnage
                    }
                }
            )
        );

        // Action pour arrêter l'animation et le déplacement
        this._scene.actionManager.registerAction(
            new ExecuteCodeAction(
                { trigger: ActionManager.OnKeyUpTrigger, parameter: 'w' }, // Touche "w" relâchée
                () => {
                    if (this._walkAnimation) {
                        this._walkAnimation.stop();
                    }
                }
            )
        );

        // Action pour démarrer l'animation "walk" et le déplacement vers la droite
        this._scene.actionManager.registerAction(
            new ExecuteCodeAction(
                { trigger: ActionManager.OnKeyDownTrigger, parameter: 'a' }, // Touche "a" (peut être modifiée) 
                () => {
                    if (this._walkAnimation) {
                        this._walkAnimation.start(true); // Démarrer l'animation en boucle
                        this._moveCharacterLeft(); // Déclencher le déplacement du personnage
                    }
                }
            )
        );
            // Action pour arrêter l'animation et le déplacement
            this._scene.actionManager.registerAction(
                new ExecuteCodeAction(
                    { trigger: ActionManager.OnKeyUpTrigger, parameter: 'a' }, // Touche "w" relâchée
                    () => {
                        if (this._walkAnimation) {
                            this._walkAnimation.stop();
                        }
                    }
                )
            );

        // Action pour démarrer l'animation "walk" et le déplacement vers la gauche 
        this._scene.actionManager.registerAction(
            new ExecuteCodeAction(
                { trigger: ActionManager.OnKeyDownTrigger, parameter: 'd' }, // Touche "d" (peut être modifiée)
                () => {
                    if (this._walkAnimation) {
                        this._walkAnimation.start(true); // Démarrer l'animation en boucle
                        this._moveCharacterRight(); // Déclencher le déplacement du personnage
                    }
                }
            )
        );
        // Action pour arrêter l'animation et le déplacement
        this._scene.actionManager.registerAction(
            new ExecuteCodeAction(
                { trigger: ActionManager.OnKeyUpTrigger, parameter: 'd' }, // Touche "w" relâchée
                () => {
                    if (this._walkAnimation) {
                        this._walkAnimation.stop();
                    }
                }
            )
        );


    }

    //Fonction de deplacement du personnage
    private _moveCharacterFront(): void {
        // Déplacer le mesh du personnage vers l'avant
        this.player.mesh.position.z += this._walkSpeed;
        console.log("Nouvelle position du mesh du joueur :", this.player.mesh.position);
    }
    private _moveCharacterBack(): void { 
        // Déplacer le mesh du personnage vers l'arrière
        this.player.mesh.position.z -= this._walkSpeed;
        this.player.mesh.rotation.y = Math.PI;
        console.log("Nouvelle position du mesh du joueur :", this.player.mesh.position);
    }
    private _moveCharacterLeft(): void { 
        // Déplacer le mesh du personnage vers la gauche
        this.player.mesh.position.x -= this._walkSpeed;
        this.player.mesh.rotation.y = Math.PI / 2;
        console.log("Nouvelle position du mesh du joueur :", this.player.mesh.position);
    }
    private _moveCharacterRight(): void { 
        // Déplacer le mesh du personnage vers la droite
        this.player.mesh.position.x += this._walkSpeed;
        this.player.mesh.rotation.y = -Math.PI / 2;
        console.log("Nouvelle position du mesh du joueur :", this.player.mesh.position);
    }

    public dispose(): void {
        this._scene.dispose();
    }
}