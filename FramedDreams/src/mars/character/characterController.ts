import { TransformNode, AnimationGroup, Scene, Mesh, UniversalCamera, Vector3, Quaternion, Ray } from "@babylonjs/core";
import { SimpleInput } from "./inputController";

export class Player extends TransformNode {
    public camera;
    public scene: Scene;
    private _input;

    public mesh: Mesh;

    private _camRoot: TransformNode;
    private _yTilt: TransformNode;

    private static readonly PLAYER_SPEED: number = 0.03;
    private static readonly JUMP_FORCE: number = 0.08;
    private static readonly GRAVITY: number = -2.0;
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
        this._walk= assets.animationGroups[2];
        this._setUpAnimations();
    }

    private _setUpAnimations(): void {

        this.scene.stopAllAnimations();
        this._walk.loopAnimation = true;
        this._idle.loopAnimation = true;

        this._currentAnim = this._idle;
        this._prevAnim = this._walk;
    }

    private _animatePlayer(): void {
        if (this._input.inputMap["w"]
            || this._input.inputMap["a"] 
            || this._input.inputMap["s"]
            || this._input.inputMap["d"]
            || this._input.inputMap["q"]
            || this._input.inputMap["z"]) {
        
            this._currentAnim = this._walk;
        } else if (this._grounded) {
            this._currentAnim = this._idle;
        } 

        if(this._currentAnim != null && this._prevAnim !== this._currentAnim){
            this._prevAnim.stop();
            this._currentAnim.play(this._currentAnim.loopAnimation);
            this._prevAnim = this._currentAnim;
        }

    }

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
        if (inputMag < 0) {
            this._inputAmt = 0;
        } else if (inputMag > 1) {
            this._inputAmt = 1;
        } else {
            this._inputAmt = inputMag;
        }

        this._moveDirection = this._moveDirection.scaleInPlace(this._inputAmt * Player.PLAYER_SPEED);

        let input = new Vector3(this._input.horizontalAxis, 0, this._input.verticalAxis);
        if (input.length() == 0) {
            return;
        }
        this.mesh.setPivotPoint(new Vector3(0, 0, 0)); 
        let camY = this._camRoot.rotationQuaternion 
        ? this._camRoot.rotationQuaternion.toEulerAngles().y 
        : this._camRoot.rotation.y;

        let angle = Math.atan2(-this._input.horizontalAxis, -this._input.verticalAxis) + camY;
        let targ = Quaternion.FromEulerAngles(0, angle, 0);
        angle += this._camRoot.rotation.y;
        this.mesh.rotationQuaternion = Quaternion.Slerp(this.mesh.rotationQuaternion, targ, 10 * this._deltaTime);
        this.mesh.setPivotPoint(new Vector3(0, 0, 0)); 
    }

    private _floorRaycast(offsetx: number, offsetz: number, raycastlen: number): Vector3 {
        let raycastFloorPos = new Vector3(this.mesh.position.x + offsetx, this.mesh.position.y + 0.5, this.mesh.position.z + offsetz);
        let ray = new Ray(raycastFloorPos, Vector3.Up().scale(-1), raycastlen);

        let predicate = function (mesh) {
            return mesh.isPickable && mesh.isEnabled();
        }
        let pick = this.scene.pickWithRay(ray, predicate);

        if (pick.hit) {
            return pick.pickedPoint;
        } else {
            return Vector3.Zero();
        }
    }

    private _isGrounded(): boolean {
        if (this._floorRaycast(0, 0, 0.6).equals(Vector3.Zero())) {
            return false;
        } else {
            return true;
        }
    }

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

    private _beforeRenderUpdate(): void {
        this._updateFromControls();
        this._updateGroundDetection();
        this._animatePlayer();
    }

    public activatePlayerCamera(): UniversalCamera {
        this.scene.registerBeforeRender(() => {
            this._beforeRenderUpdate();
            this._updateCamera();
        })
        return this.camera;
    }

    private _updateCamera(): void {
        const smoothness = 0.5;

        const targetPosition = new Vector3(
            this.mesh.position.x - 1,
            this.mesh.position.y,
            this.mesh.position.z
        );

        this._camRoot.position = Vector3.Lerp(this._camRoot.position, targetPosition, smoothness);
    }

    private _setupPlayerCamera() {
        this._camRoot = new TransformNode("root", this.scene);
        this._camRoot.position = new Vector3(0, 0, 0);
        this._camRoot.rotation = new Vector3(0, -Math.PI/2, 0);

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