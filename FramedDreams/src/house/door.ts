import {Mesh, Vector3, Tools, Quaternion, TransformNode } from "@babylonjs/core";

/**
 * Classe représentant une porte interactive dans la maison.
 * Gère l'ouverture/fermeture de la porte via rotation du parent (charnière).
 */
export class Door {
    /** Nœud de transformation servant de charnière pour l’ouverture de la porte */
    private _hinge: TransformNode;

    /** État actuel de la porte (ouverte ou non) */
    private _doorOpened: boolean = false;

    /** Nom du mesh représentant la porte */
    private _doorName: String;

    /**
     * Crée une instance de Door.
     * @param door - Mesh de la porte (doit avoir un parent comme charnière)
     */
    constructor(door: Mesh) {
        this._hinge = door.parent as TransformNode;
        this._doorName = door.name;
    }

    /**
     * Retourne le nom du mesh de la porte.
     * @returns Nom de la porte
     */
    public getName(): String {
        return this._doorName;
    }

    /**
     * Fait pivoter la porte pour l’ouvrir ou la fermer.
     */
    public rotateDoor(): void {
        this._doorOpened = !this._doorOpened;
        const targetRotationDegrees = this._doorOpened ? 90 : 0;
        const targetRotationRadians = Tools.ToRadians(targetRotationDegrees);
        const targetQuaternion = Quaternion.RotationAxis(Vector3.Up(), targetRotationRadians);
        this._hinge.rotationQuaternion = targetQuaternion;
    }
}
