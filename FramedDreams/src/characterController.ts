import { Scene, Vector3, Ray, TransformNode, ArcRotateCamera, Mesh, Color3, Color4, UniversalCamera, Quaternion, AnimationGroup, ExecuteCodeAction, ActionManager, ParticleSystem, Texture, SphereParticleEmitter, Sound, Observable, ShadowGenerator } from "@babylonjs/core";

export class Player extends TransformNode {
    public camera;
    public scene: Scene;
    private _input;

    //Player
    public mesh: Mesh; //outer collisionbox of player

    constructor(assets, scene: Scene, shadowGenerator: ShadowGenerator, input?) {
        super("player", scene);
        this.scene = scene;
        this._setupPlayerCamera();

        this.mesh = assets.mesh;
        this.mesh.parent = this;

        shadowGenerator.addShadowCaster(assets.mesh); //the player mesh will cast shadows

        this._input = input; //inputs we will get from inputController.ts

        // Enable collisions and gravity
        this.scene.collisionsEnabled = true;
        this.mesh.checkCollisions = true;
        this.scene.gravity = new Vector3(0, -0.98, 0);

        // Set ellipsoid for collisions
        this.mesh.ellipsoid = new Vector3(0.5, 1, 0.5);
        this.mesh.ellipsoidOffset = new Vector3(0, 1, 0);

        // Move the player to a starting position (optional)
        this.position = new Vector3(0, 0, 0); // Starting position above the ground
    }

    private _setupPlayerCamera() {
        var camera4 = new ArcRotateCamera("arc", -Math.PI/2, Math.PI/2, 40, new Vector3(0,3,0), this.scene);
    }
}