import * as GUI from "@babylonjs/gui";
import { AdvancedDynamicTexture } from "@babylonjs/gui";

export class GUIHouse {
    private _advancedTexture: AdvancedDynamicTexture;
    private _crosshair: GUI.Ellipse;

    constructor(_advancedTexture: AdvancedDynamicTexture) {
        this._advancedTexture = _advancedTexture;
        this._createCrosshair();
    }

    private _createCrosshair(): void {
        this._crosshair = new GUI.Ellipse();
        this._crosshair.width = "8px";
        this._crosshair.height = "8px";
        this._crosshair.color = "white";
        this._crosshair.thickness = 1;
        this._crosshair.background = "white";
        this._crosshair.alpha = 1;
        this._crosshair.left = "0px";
        this._crosshair.top = "0px";
        this._crosshair.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this._crosshair.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this._advancedTexture.addControl(this._crosshair);
    }

    public dispose(): void {
        this._advancedTexture.dispose();
    }

    public addControl(control: GUI.Control): void {
        this._advancedTexture.addControl(control);
    }
}