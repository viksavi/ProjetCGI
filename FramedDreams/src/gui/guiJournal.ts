import { TextBlock, StackPanel, AdvancedDynamicTexture, Image, Button, Rectangle, Control } from "@babylonjs/gui";
import { Scene, Mesh, Vector3 } from "@babylonjs/core";
import { Player } from "../mars/character/characterController";

export class GUIJournal {
    private _scene: Scene;
    private _uiTexture: AdvancedDynamicTexture;
    private _panel: Rectangle;
    private _image: Image;
    private _bookGrabDistance: number = 1;
    private _book: Mesh;
    private _player: Mesh;
    public journalOpen: boolean = false;
    private _isManuallyClosed: boolean = false;
    
    constructor(scene: Scene, book: Mesh, player: Mesh) {
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

    public show(): void {
        if (!this.journalOpen) { 
            this._panel.isVisible = true;
            this.journalOpen = true;
            this._isManuallyClosed = false;
        }
    }
    
    public hide(): void {
        if (this.journalOpen) {
            this._panel.isVisible = false;
            this.journalOpen = false;
            this._isManuallyClosed = true;
        }
    }
    
    public update(bookParent: Mesh): void {
        if (!this._player || !bookParent) return;
    
        const distance = Vector3.Distance(this._player.getAbsolutePosition(), bookParent.getAbsolutePosition());

        if (distance <= this._bookGrabDistance && !this._isManuallyClosed) {
            this.show();
        } 
        
        // Permet de réactiver l'ouverture automatique après éloignement
        if (distance > this._bookGrabDistance && !this.journalOpen) {
            this._isManuallyClosed = false;
        }
    }
    
    public close(): void {
        this.hide();
        this._uiTexture.dispose();
    }
}
