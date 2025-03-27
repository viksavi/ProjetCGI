import { AbstractScene } from "./abstractScene";
export class AbstractModelScene extends AbstractScene {
    constructor(engine) {
        super(engine);
        Object.defineProperty(this, "environment", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
