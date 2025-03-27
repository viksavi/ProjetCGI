export class Environment {
    constructor(scene) {
        Object.defineProperty(this, "_scene", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "assets", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this._scene = scene;
    }
}
