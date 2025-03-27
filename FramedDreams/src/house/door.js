import { Vector3, Tools, Quaternion } from "@babylonjs/core";
export class Door {
    constructor(door) {
        Object.defineProperty(this, "_hinge", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_doorOpened", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_doorName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this._hinge = door.parent;
        this._doorName = door.name;
    }
    getName() {
        return this._doorName;
    }
    rotateDoor() {
        this._doorOpened = !this._doorOpened;
        const targetRotationDegrees = this._doorOpened ? 90 : 0;
        const targetRotationRadians = Tools.ToRadians(targetRotationDegrees);
        const targetQuaternion = Quaternion.RotationAxis(Vector3.Up(), targetRotationRadians);
        this._hinge.rotationQuaternion = targetQuaternion;
    }
}
