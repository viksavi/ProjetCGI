import { TransformNode, AnimationGroup, Scene, Mesh, UniversalCamera, Vector3, Quaternion, Ray } from "@babylonjs/core";
import { SimpleInput } from "./inputController";

/**
 * Classe représentant le joueur dans la scène.
 * Gère la caméra, les déplacements, la gravité, les animations et les entrées utilisateur.
 */
export class Player extends TransformNode {
    /** Caméra du joueur (suivie depuis l’extérieur via TransformNodes) */
    public camera;

    /** Scène Babylon.js dans laquelle évolue le joueur */
    public scene: Scene;

    /** Gestionnaire d’entrées clavier */
    private _input: SimpleInput;

    /** Mesh principal du joueur (modèle 3D animé) */
    public mesh: Mesh;

    /** Nœud racine pour les transformations de caméra */
    private _camRoot: TransformNode;

    /** Nœud intermédiaire pour appliquer l’inclinaison verticale (tilt) de la caméra */
    private _yTilt: TransformNode;

    /** Vitesse de déplacement du joueur */
    private static readonly PLAYER_SPEED: number = 0.03;

    /** Force de saut maximale */
    private static readonly JUMP_FORCE: number = 0.08;

    /** Gravité appliquée au joueur */
    private static readonly GRAVITY: number = -2.0;

    /** Inclinaison initiale de la caméra */
    private static readonly ORIGINAL_TILT: Vector3 = new Vector3(0.55, 0, 0);

    private _deltaTime: number = 0;
    private _h: number;
    private _v: number;

    private _moveDirection: Vector3 = new Vector3();
    private _inputAmt: number;

    private _gravity: Vector3 = new Vector3();
    private _lastGroundPos: Vector3 = Vector3.Zero();
    private _grounded: boolean;

    private _currentAnim: AnimationGroup;
    private _prevAnim: AnimationGroup;
    private _idle: AnimationGroup;
    private _walk: AnimationGroup;

    private _currentRotationY: number = 0;

    /**
     * Crée une nouvelle instance de joueur.
     * @param assets - Mesh et animations chargés
     * @param scene - Scène Babylon.js
     */
    constructor(assets, scene: Scene) {
        super("player", scene);
        this.scene = scene;
        this._setupPlayerCamera();

        this.mesh = assets.mesh;
        this.mesh.parent = this;

        if (this.mesh.parent) {
            this.mesh.parent = null;
        }

        this._input = new SimpleInput(scene);
        this.mesh.setPivotPoint(Vector3.Zero());

        this._idle = assets.animationGroups[0];
        this._walk = assets.animationGroups[2];
        this._setUpAnimations();
    }

    /**
     * Configure les animations du joueur (idle, walk).
     */
    private _setUpAnimations(): void {
        this.scene.stopAllAnimations();
        this._walk.loopAnimation = true;
        this._idle.loopAnimation = true;

        this._currentAnim = this._idle;
        this._prevAnim = this._walk;
    }

    /**
     * Met à jour et joue les animations en fonction de l’état d’entrée.
     */
    private _animatePlayer(): void {
        if (
            this._input.inputMap["w"] ||
            this._input.inputMap["a"] ||
            this._input.inputMap["s"] ||
            this._input.inputMap["d"] ||
            this._input.inputMap["q"] ||
            this._input.inputMap["z"]
        ) {
            this._currentAnim = this._walk;
        } else if (this._grounded) {
            this._currentAnim = this._idle;
        }

        if (this._currentAnim != null && this._prevAnim !== this._currentAnim) {
            this._prevAnim.stop();
            this._currentAnim.play(this._currentAnim.loopAnimation);
            this._prevAnim = this._currentAnim;
        }
    }

    /**
     * Met à jour le mouvement du joueur selon les entrées clavier.
     */
    private _updateFromControls(): void {
        this._deltaTime = this.scene.getEngine().getDeltaTime() / 1000.0;
        this._moveDirection = Vector3.Zero();

        this._h = this._input.horizontal;
        this._v = this._input.vertical;
        let fwd = this._camRoot.forward.clone();
        let right = this._camRoot.right.clone();
        let correctedVertical = fwd.scaleInPlace(this._v);
        let correctedHorizontal = right.scaleInPlace(this._h);

        let move = correctedHorizontal.addInPlace(correctedVertical);
        this._moveDirection = new Vector3((move).normalize().x, 0, (move).normalize().z);

        let inputMag = Math.abs(this._h) + Math.abs(this._v);
        this._inputAmt = Math.min(Math.max(inputMag, 0), 1);

        this._moveDirection = this._moveDirection.scaleInPlace(this._inputAmt * Player.PLAYER_SPEED);

        let input = new Vector3(this._input.horizontalAxis, 0, this._input.verticalAxis);
        if (input.length() === 0) return;

        this.mesh.setPivotPoint(Vector3.Zero());

        let camY = this._camRoot.rotationQuaternion 
            ? this._camRoot.rotationQuaternion.toEulerAngles().y 
            : this._camRoot.rotation.y;

        let angle = Math.atan2(-this._input.horizontalAxis, -this._input.verticalAxis) + camY;
        let targ = Quaternion.FromEulerAngles(0, angle, 0);
        this.mesh.rotationQuaternion = Quaternion.Slerp(this.mesh.rotationQuaternion, targ, 10 * this._deltaTime);
        this.mesh.setPivotPoint(Vector3.Zero());
    }

    /**
     * Effectue un raycast vers le sol pour détecter une surface sous le joueur.
     * @param offsetx - Décalage X
     * @param offsetz - Décalage Z
     * @param raycastlen - Longueur du rayon
     * @returns Position au sol détectée ou Vector3.Zero()
     */
    private _floorRaycast(offsetx: number, offsetz: number, raycastlen: number): Vector3 {
        let raycastFloorPos = new Vector3(this.mesh.position.x + offsetx, this.mesh.position.y + 0.5, this.mesh.position.z + offsetz);
        let ray = new Ray(raycastFloorPos, Vector3.Up().scale(-1), raycastlen);

        let predicate = (mesh) => mesh.isPickable && mesh.isEnabled();
        let pick = this.scene.pickWithRay(ray, predicate);

        return pick.hit ? pick.pickedPoint : Vector3.Zero();
    }

    /**
     * Vérifie si le joueur touche le sol.
     * @returns true si au sol, sinon false
     */
    private _isGrounded(): boolean {
        return !this._floorRaycast(0, 0, 0.6).equals(Vector3.Zero());
    }

    /**
     * Met à jour la détection de collision avec le sol et applique la gravité.
     */
    private _updateGroundDetection(): void {
        if (!this._isGrounded()) {
            this._gravity = this._gravity.addInPlace(Vector3.Up().scale(this._deltaTime * Player.GRAVITY));
            this._grounded = false;
        }

        if (this._gravity.y < -Player.JUMP_FORCE) {
            this._gravity.y = -Player.JUMP_FORCE;
        }

        this.mesh.moveWithCollisions(this._moveDirection.addInPlace(this._gravity));

        if (this._isGrounded()) {
            this._gravity.y = 0;
            this._grounded = true;
            this._lastGroundPos.copyFrom(this.mesh.position);
        }
    }

    /**
     * Fonction appelée à chaque frame pour mettre à jour le joueur.
     */
    private _beforeRenderUpdate(): void {
        this._updateFromControls();
        this._updateGroundDetection();
        this._animatePlayer();
    }

    /**
     * Active la caméra du joueur et enregistre la boucle de mise à jour.
     * @returns La caméra universelle attachée au joueur
     */
    public activatePlayerCamera(): UniversalCamera {
        this.scene.registerBeforeRender(() => {
            this._beforeRenderUpdate();
            this._updateCamera();
        });
        return this.camera;
    }

    /**
     * Retourne l’instance de gestion des entrées clavier.
     * @returns SimpleInput
     */
    public getInputs(): SimpleInput {      
        return this._input;
    }

    /**
     * Met à jour la position de la caméra pour suivre le joueur.
     */
    private _updateCamera(): void {
        const smoothness = 0.5;
        const targetPosition = new Vector3(
            this.mesh.position.x - 1,
            this.mesh.position.y,
            this.mesh.position.z
        );
        this._camRoot.position = Vector3.Lerp(this._camRoot.position, targetPosition, smoothness);
    }

    /**
     * Crée et configure la caméra 3D du joueur.
     * Utilise deux TransformNode pour gérer la rotation Y (camRoot) et le tilt vertical (yTilt).
     */
    private _setupPlayerCamera() {
        this._camRoot = new TransformNode("root", this.scene);
        this._camRoot.position = new Vector3(0, 0, 0);
        this._camRoot.rotation = new Vector3(0, -Math.PI / 2, 0);

        let yTilt = new TransformNode("ytilt", this.scene);
        yTilt.rotation = Player.ORIGINAL_TILT;
        this._yTilt = yTilt;
        yTilt.parent = this._camRoot;

        this.camera = new UniversalCamera("cam", new Vector3(0, 0, -10), this.scene);
        this.camera.lockedTarget = this._camRoot.position;
        this.camera.fov = 0.4;
        this.camera.parent = yTilt;

        this.scene.activeCamera = this.camera;
        return this.camera;
    }
}
