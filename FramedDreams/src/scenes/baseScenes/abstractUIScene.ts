import { AbstractScene } from "./abstractScene";
import { Engine } from "@babylonjs/core";

export abstract class AbstractUIScene extends AbstractScene {
    constructor(engine: Engine) {
        super(engine);
    }
}