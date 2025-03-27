import { AdvancedDynamicTexture, Image, Button, Rectangle, Control } from "@babylonjs/gui";
import { Vector3 } from "@babylonjs/core";
export class GUIJournal {
    constructor(scene, book, player) {
        Object.defineProperty(this, "_scene", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_uiTexture", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_panel", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_image", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_bookGrabDistance", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1
        });
        Object.defineProperty(this, "_book", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_player", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "journalOpen", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_isManuallyClosed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        this._scene = scene;
        this._book = book;
        this._player = player;
        this._uiTexture = AdvancedDynamicTexture.CreateFullscreenUI("Journal");
        this._panel = new Rectangle();
        this._panel.height = "95%";
        this._panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this._panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this._panel.thickness = 0;
        this._panel.background = "transparent";
        this._panel.isVisible = false;
        this._uiTexture.addControl(this._panel);
        this._image = new Image("Feuille", "../../textures/Feuille.png");
        this._image.height = "95%";
        this._image.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this._image.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this._image.stretch = Image.STRETCH_UNIFORM;
        this._panel.addControl(this._image);
        const closeButton = Button.CreateSimpleButton("closeButton", "Fermer");
        closeButton.width = "100px";
        closeButton.height = "40px";
        closeButton.color = "rgb(104, 90, 68)";
        closeButton.background = "transparent";
        closeButton.thickness = 0;
        closeButton.top = "40%";
        closeButton.fontStyle = "EB Garamond";
        closeButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this._panel.addControl(closeButton);
        closeButton.onPointerClickObservable.add(() => {
            this.hide();
        });
    }
    show() {
        if (!this.journalOpen) {
            this._panel.isVisible = true;
            this.journalOpen = true;
            this._isManuallyClosed = false;
        }
    }
    hide() {
        if (this.journalOpen) {
            this._panel.isVisible = false;
            this.journalOpen = false;
            this._isManuallyClosed = true;
        }
    }
    update(bookParent) {
        if (!this._player || !bookParent)
            return;
        const distance = Vector3.Distance(this._player.getAbsolutePosition(), bookParent.getAbsolutePosition());
        if (distance <= this._bookGrabDistance && !this._isManuallyClosed) {
            this.show();
        }
        if (distance > this._bookGrabDistance && !this.journalOpen) {
            this._isManuallyClosed = false;
        }
    }
    close() {
        this.hide();
        this._uiTexture.dispose();
    }
}
