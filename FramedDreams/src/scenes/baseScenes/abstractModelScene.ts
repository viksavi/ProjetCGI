import { Environment } from "../../environments/environment";
import { AbstractScene } from "./abstractScene";

import { Engine } from "@babylonjs/core";

export abstract class AbstractModelScene extends AbstractScene {
    protected environment: Environment;

    constructor(engine: Engine) {
        super(engine);
    }

    protected abstract _loadCharacterAssets(): Promise<void>;
}