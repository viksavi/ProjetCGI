import {
    Scene,
    Vector3,
    TransformNode,
    ArcRotateCamera,
    Mesh,
    Quaternion,
    AnimationGroup,
    ActionManager,
    ExecuteCodeAction,
} from "@babylonjs/core";

interface IPlayer {
    mesh: Mesh;
    animationGroups: AnimationGroup[];
    scene: Scene;
    scaling: Vector3;
    position: Vector3;
}

export class Player extends TransformNode {
    public scene: Scene;
    public mesh: Mesh;
    public animationGroups: AnimationGroup[];
    public scaling: Vector3;
    public position: Vector3;

    constructor(params: IPlayer) {
        super("player", params.scene);

        this.scene = params.scene;
        this.mesh = params.mesh;
        this.animationGroups = params.animationGroups;
        this.scaling = params.scaling;
        this.position = params.position;

        this.mesh.parent = this;

        //Enable collisions and gravity
        this.scene.collisionsEnabled = true;
        this.mesh.checkCollisions = true;
        this.scene.gravity = new Vector3(0, -0.98, 0);

        // Set ellipsoid for collisions
        this.mesh.ellipsoid = new Vector3(0.5, 1, 0.5);
        this.mesh.ellipsoidOffset = new Vector3(0, 1, 0);
    }
}